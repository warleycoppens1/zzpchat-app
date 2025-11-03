'use client'

interface QRCodeProps {
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
  variant?: 'default' | 'hero' | 'cta'
}

export function QRCode({ 
  size = 'md', 
  showLabel = true, 
  className = '',
  variant = 'default'
}: QRCodeProps) {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48', 
    lg: 'w-64 h-64'
  }

  const logoSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }

  const borderClasses = {
    default: 'border-2 border-gray-200 dark:border-gray-700',
    hero: 'border-2 border-white/20',
    cta: 'border-2 border-white/30'
  }

  const backgroundClasses = {
    default: 'bg-white',
    hero: 'bg-white/95 backdrop-blur-sm',
    cta: 'bg-white/90 backdrop-blur-sm'
  }

  return (
    <div className={`inline-block ${className}`}>
      <div className={`${sizeClasses[size]} ${backgroundClasses[variant]} ${borderClasses[variant]} rounded-2xl flex items-center justify-center shadow-lg`}>
        {/* Mock QR Code Pattern */}
        <div className="w-5/6 h-5/6 bg-gray-900 rounded-lg relative overflow-hidden">
          {/* QR Code Pattern */}
          <div className="absolute inset-2 bg-white rounded">
            <div className="grid grid-cols-12 gap-px h-full p-2">
              {Array.from({ length: 144 }).map((_, i) => {
                // Create more realistic QR pattern with corner squares and data patterns
                // Use deterministic pseudo-random based on index to avoid hydration mismatch
                const row = Math.floor(i / 12)
                const col = i % 12
                const isCorner = (row < 3 && col < 3) || (row < 3 && col > 8) || (row > 8 && col < 3)
                const isCenter = row > 4 && row < 7 && col > 4 && col < 7
                const isData = !isCorner && !isCenter
                
                // Deterministic pseudo-random function based on index
                const pseudoRandom = (seed: number) => {
                  const x = Math.sin(seed) * 10000
                  return x - Math.floor(x)
                }
                
                let shouldFill = false
                if (isCorner) shouldFill = true
                else if (isCenter) shouldFill = pseudoRandom(i) > 0.3
                else if (isData) shouldFill = pseudoRandom(i * 7 + 13) > 0.4
                
                return (
                  <div
                    key={i}
                    className={`${
                      shouldFill ? 'bg-black' : 'bg-white'
                    } aspect-square`}
                  />
                )
              })}
            </div>
          </div>
          {/* WhatsApp Logo in Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${logoSizes[size]} bg-white rounded-full flex items-center justify-center shadow-lg`}>
              <svg className={`${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-7 h-7' : 'w-10 h-10'} text-green-600`} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {showLabel && (
        <div className="mt-3 text-center">
          <p className={`text-sm font-medium ${
            variant === 'hero' ? 'text-white/90' : 
            variant === 'cta' ? 'text-white' : 
            'text-gray-700 dark:text-gray-300'
          }`}>
            Start Direct via WhatsApp
          </p>
          <p className={`text-xs ${
            variant === 'hero' ? 'text-white/70' : 
            variant === 'cta' ? 'text-white/80' : 
            'text-gray-500 dark:text-gray-400'
          }`}>
            Geen registratie nodig
          </p>
        </div>
      )}
    </div>
  )
}
