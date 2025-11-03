export enum SubscriptionTier {
  STARTER = 'STARTER',
  PRO = 'PRO',
  BUSINESS = 'BUSINESS',
  FREE = 'FREE',
  BASIC = 'BASIC', 
  ENTERPRISE = 'ENTERPRISE'
}

export interface SubscriptionLimits {
  storageLimit: number // in bytes
  fileSizeLimit: number // in bytes
  filesPerMonth: number // -1 for unlimited
  price: number // in euros
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  [SubscriptionTier.STARTER]: {
    storageLimit: 10 * 1024 * 1024, // 10 MB
    fileSizeLimit: 2 * 1024 * 1024, // 2 MB
    filesPerMonth: 5,
    price: 0
  },
  [SubscriptionTier.PRO]: {
    storageLimit: 100 * 1024 * 1024, // 100 MB
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    filesPerMonth: 50,
    price: 9.99
  },
  [SubscriptionTier.BUSINESS]: {
    storageLimit: 1024 * 1024 * 1024, // 1 GB
    fileSizeLimit: 50 * 1024 * 1024, // 50 MB
    filesPerMonth: 500,
    price: 29.99
  },
  [SubscriptionTier.FREE]: {
    storageLimit: 10 * 1024 * 1024, // 10 MB
    fileSizeLimit: 2 * 1024 * 1024, // 2 MB
    filesPerMonth: 5,
    price: 0
  },
  [SubscriptionTier.BASIC]: {
    storageLimit: 100 * 1024 * 1024, // 100 MB
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB
    filesPerMonth: 50,
    price: 9.99
  },
  [SubscriptionTier.ENTERPRISE]: {
    storageLimit: 10 * 1024 * 1024 * 1024, // 10 GB
    fileSizeLimit: 100 * 1024 * 1024, // 100 MB
    filesPerMonth: -1, // unlimited
    price: 99.99
  }
}

export function getSubscriptionLimits(tier: SubscriptionTier): SubscriptionLimits {
  return SUBSCRIPTION_LIMITS[tier]
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function canUploadFile(
  tier: SubscriptionTier,
  currentStorage: number,
  fileSize: number,
  filesUploadedThisMonth: number
): { allowed: boolean; reason?: string } {
  const limits = getSubscriptionLimits(tier)
  
  // Check storage limit
  if (currentStorage + fileSize > limits.storageLimit) {
    return {
      allowed: false,
      reason: `Storage limit exceeded. You have ${formatBytes(currentStorage)}/${formatBytes(limits.storageLimit)} used.`
    }
  }
  
  // Check file size limit
  if (fileSize > limits.fileSizeLimit) {
    return {
      allowed: false,
      reason: `File size exceeds limit. Maximum file size for ${tier} tier is ${formatBytes(limits.fileSizeLimit)}.`
    }
  }
  
  // Check monthly file limit (if not unlimited)
  if (limits.filesPerMonth !== -1 && filesUploadedThisMonth >= limits.filesPerMonth) {
    return {
      allowed: false,
      reason: `Monthly file limit reached. You can upload ${limits.filesPerMonth} files per month with ${tier} tier.`
    }
  }
  
  return { allowed: true }
}

export function getUpgradeMessage(currentTier: SubscriptionTier): string {
  const currentLimits = getSubscriptionLimits(currentTier)
  
  switch (currentTier) {
    case SubscriptionTier.STARTER:
    case SubscriptionTier.FREE:
      return `Upgrade to Pro (€${SUBSCRIPTION_LIMITS.PRO.price}/month) for ${formatBytes(SUBSCRIPTION_LIMITS.PRO.storageLimit)} storage and ${SUBSCRIPTION_LIMITS.PRO.filesPerMonth} files/month`
    case SubscriptionTier.PRO:
      return `Upgrade to Business (€${SUBSCRIPTION_LIMITS.BUSINESS.price}/month) for ${formatBytes(SUBSCRIPTION_LIMITS.BUSINESS.storageLimit)} storage and ${SUBSCRIPTION_LIMITS.BUSINESS.filesPerMonth} files/month`
    case SubscriptionTier.BASIC:
      return `Upgrade to Pro (€${SUBSCRIPTION_LIMITS.PRO.price}/month) for ${formatBytes(SUBSCRIPTION_LIMITS.PRO.storageLimit)} storage and ${SUBSCRIPTION_LIMITS.PRO.filesPerMonth} files/month`
    case SubscriptionTier.BUSINESS:
      return `Upgrade to Enterprise (€${SUBSCRIPTION_LIMITS.ENTERPRISE.price}/month) for ${formatBytes(SUBSCRIPTION_LIMITS.ENTERPRISE.storageLimit)} storage and unlimited files`
    case SubscriptionTier.ENTERPRISE:
      return 'You have the highest tier available'
    default:
      return 'You have the highest tier available'
  }
}

/**
 * Check if user can upload file based on actual file count in database
 * This is more accurate than using the filesUploaded counter
 */
export async function canUploadFileAccurate(
  userId: string,
  tier: SubscriptionTier,
  fileSize: number,
  prisma: any
): Promise<{ allowed: boolean; reason?: string; currentCount: number; limit: number }> {
  const limits = getSubscriptionLimits(tier)
  
  // Get actual file count from database for this month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const actualFileCount = await prisma.userFile.count({
    where: {
      userId,
      uploadedAt: {
        gte: startOfMonth
      }
    }
  })
  
  // Get current storage usage
  const storageUsed = await prisma.userFile.aggregate({
    where: { userId },
    _sum: { fileSize: true }
  })
  
  const currentStorage = storageUsed._sum.fileSize || 0
  
  // Check storage limit
  if (currentStorage + fileSize > limits.storageLimit) {
    return {
      allowed: false,
      reason: `Storage limit exceeded. You have ${formatBytes(currentStorage)}/${formatBytes(limits.storageLimit)} used.`,
      currentCount: actualFileCount,
      limit: limits.filesPerMonth
    }
  }
  
  // Check file size limit
  if (fileSize > limits.fileSizeLimit) {
    return {
      allowed: false,
      reason: `File size exceeds limit. Maximum file size for ${tier} tier is ${formatBytes(limits.fileSizeLimit)}.`,
      currentCount: actualFileCount,
      limit: limits.filesPerMonth
    }
  }
  
  // Check monthly file limit (if not unlimited)
  if (limits.filesPerMonth !== -1 && actualFileCount >= limits.filesPerMonth) {
    return {
      allowed: false,
      reason: `Monthly file limit reached. You can upload ${limits.filesPerMonth} files per month with ${tier} tier.`,
      currentCount: actualFileCount,
      limit: limits.filesPerMonth
    }
  }
  
  return { 
    allowed: true, 
    currentCount: actualFileCount, 
    limit: limits.filesPerMonth 
  }
}
