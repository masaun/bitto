(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-data-var contract-owner principal tx-sender)
(define-data-var ai-work-nonce uint u0)

(define-map ai-generated-works
  uint
  {
    human-creator: principal,
    ai-provider: principal,
    contribution-split: uint,
    source-works: (list 10 uint),
    created-at: uint,
    verified: bool
  }
)

(define-map ai-rights-splits
  { ai-work-id: uint, party: principal }
  {
    percentage: uint,
    party-type: (string-ascii 20)
  }
)

(define-map ai-work-metadata
  uint
  {
    title: (string-utf8 200),
    model-used: (string-ascii 50),
    prompt-hash: (buff 32)
  }
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-ai-work (ai-work-id uint))
  (ok (map-get? ai-generated-works ai-work-id))
)

(define-read-only (get-ai-rights-split (ai-work-id uint) (party principal))
  (ok (map-get? ai-rights-splits { ai-work-id: ai-work-id, party: party }))
)

(define-read-only (get-ai-work-metadata (ai-work-id uint))
  (ok (map-get? ai-work-metadata ai-work-id))
)

(define-read-only (get-ai-work-nonce)
  (ok (var-get ai-work-nonce))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (register-ai-work
  (ai-provider principal)
  (contribution-split uint)
  (source-works (list 10 uint))
  (title (string-utf8 200))
  (model-used (string-ascii 50))
  (prompt-hash (buff 32))
)
  (let ((ai-work-id (+ (var-get ai-work-nonce) u1)))
    (map-set ai-generated-works ai-work-id {
      human-creator: tx-sender,
      ai-provider: ai-provider,
      contribution-split: contribution-split,
      source-works: source-works,
      created-at: stacks-block-height,
      verified: false
    })
    (map-set ai-work-metadata ai-work-id {
      title: title,
      model-used: model-used,
      prompt-hash: prompt-hash
    })
    (var-set ai-work-nonce ai-work-id)
    (ok ai-work-id)
  )
)

(define-public (set-rights-split
  (ai-work-id uint)
  (party principal)
  (percentage uint)
  (party-type (string-ascii 20))
)
  (let ((ai-work (unwrap! (map-get? ai-generated-works ai-work-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (get human-creator ai-work)) ERR_UNAUTHORIZED)
    (ok (map-set ai-rights-splits { ai-work-id: ai-work-id, party: party } {
      percentage: percentage,
      party-type: party-type
    }))
  )
)

(define-public (verify-ai-work (ai-work-id uint))
  (let ((ai-work (unwrap! (map-get? ai-generated-works ai-work-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set ai-generated-works ai-work-id (merge ai-work { verified: true })))
  )
)
