(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_CONSENT_REVOKED (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map training-consents
  { work-id: uint, artist: principal }
  {
    consent-given: bool,
    consent-date: uint,
    compensation-model: (string-ascii 30),
    revocable: bool,
    restrictions: (string-utf8 200)
  }
)

(define-map ai-training-usage
  { work-id: uint, ai-provider: principal }
  {
    usage-count: uint,
    first-used: uint,
    last-used: uint,
    compensation-paid: uint
  }
)

(define-map authorized-ai-providers
  principal
  bool
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-training-consent (work-id uint) (artist principal))
  (ok (map-get? training-consents { work-id: work-id, artist: artist }))
)

(define-read-only (get-ai-usage (work-id uint) (ai-provider principal))
  (ok (map-get? ai-training-usage { work-id: work-id, ai-provider: ai-provider }))
)

(define-read-only (is-ai-provider-authorized (provider principal))
  (ok (default-to false (map-get? authorized-ai-providers provider)))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (grant-training-consent
  (work-id uint)
  (compensation-model (string-ascii 30))
  (revocable bool)
  (restrictions (string-utf8 200))
)
  (begin
    (ok (map-set training-consents { work-id: work-id, artist: tx-sender } {
      consent-given: true,
      consent-date: stacks-block-height,
      compensation-model: compensation-model,
      revocable: revocable,
      restrictions: restrictions
    }))
  )
)

(define-public (revoke-consent (work-id uint))
  (let ((consent (unwrap! (map-get? training-consents { work-id: work-id, artist: tx-sender }) ERR_NOT_FOUND)))
    (asserts! (get revocable consent) ERR_UNAUTHORIZED)
    (ok (map-set training-consents { work-id: work-id, artist: tx-sender } 
      (merge consent { consent-given: false })))
  )
)

(define-public (authorize-ai-provider (provider principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set authorized-ai-providers provider true))
  )
)

(define-public (record-training-usage (work-id uint))
  (let 
    (
      (usage (default-to 
        { usage-count: u0, first-used: stacks-block-height, last-used: stacks-block-height, compensation-paid: u0 }
        (map-get? ai-training-usage { work-id: work-id, ai-provider: tx-sender })))
    )
    (asserts! (default-to false (map-get? authorized-ai-providers tx-sender)) ERR_UNAUTHORIZED)
    (ok (map-set ai-training-usage { work-id: work-id, ai-provider: tx-sender } 
      (merge usage { 
        usage-count: (+ (get usage-count usage) u1),
        last-used: stacks-block-height
      })))
  )
)
