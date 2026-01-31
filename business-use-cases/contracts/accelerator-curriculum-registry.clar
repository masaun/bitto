(define-map curriculum
  { module-id: uint }
  {
    program-id: uint,
    module-name: (string-ascii 100),
    description: (string-ascii 500),
    duration: uint,
    sequence: uint,
    content-hash: (buff 32)
  }
)

(define-data-var module-nonce uint u0)

(define-public (add-module (program uint) (name (string-ascii 100)) (description (string-ascii 500)) (duration uint) (sequence uint) (hash (buff 32)))
  (let ((module-id (+ (var-get module-nonce) u1)))
    (map-set curriculum
      { module-id: module-id }
      {
        program-id: program,
        module-name: name,
        description: description,
        duration: duration,
        sequence: sequence,
        content-hash: hash
      }
    )
    (var-set module-nonce module-id)
    (ok module-id)
  )
)

(define-read-only (get-module (module-id uint))
  (map-get? curriculum { module-id: module-id })
)
