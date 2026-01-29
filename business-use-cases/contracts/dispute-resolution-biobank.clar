(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)

(define-map disputes
  { dispute-id: uint }
  {
    dispute-type: (string-ascii 50),
    claimant: principal,
    respondent: principal,
    subject-id: uint,
    description: (string-ascii 300),
    evidence-hash: (buff 32),
    filed-at: uint,
    resolved: bool,
    resolution: (optional (string-ascii 200)),
    resolver: (optional principal)
  }
)

(define-data-var dispute-nonce uint u0)

(define-read-only (get-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-dispute (dispute-id uint))
  (ok (map-get? disputes { dispute-id: dispute-id }))
)

(define-public (set-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (file-dispute (dispute-type (string-ascii 50)) (respondent principal) (subject-id uint) (description (string-ascii 300)) (evidence-hash (buff 32)))
  (let
    (
      (dispute-id (var-get dispute-nonce))
    )
    (asserts! (is-none (map-get? disputes { dispute-id: dispute-id })) ERR_ALREADY_EXISTS)
    (map-set disputes
      { dispute-id: dispute-id }
      {
        dispute-type: dispute-type,
        claimant: tx-sender,
        respondent: respondent,
        subject-id: subject-id,
        description: description,
        evidence-hash: evidence-hash,
        filed-at: stacks-block-height,
        resolved: false,
        resolution: none,
        resolver: none
      }
    )
    (var-set dispute-nonce (+ dispute-id u1))
    (ok dispute-id)
  )
)

(define-public (resolve-dispute (dispute-id uint) (resolution (string-ascii 200)))
  (let
    (
      (dispute (unwrap! (map-get? disputes { dispute-id: dispute-id }) ERR_NOT_FOUND))
    )
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set disputes
      { dispute-id: dispute-id }
      (merge dispute {
        resolved: true,
        resolution: (some resolution),
        resolver: (some tx-sender)
      })
    ))
  )
)
