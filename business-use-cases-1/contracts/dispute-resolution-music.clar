(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_ALREADY_EXISTS (err u102))

(define-data-var contract-owner principal tx-sender)
(define-data-var dispute-nonce uint u0)

(define-map disputes
  uint
  {
    complainant: principal,
    respondent: principal,
    dispute-type: (string-ascii 30),
    work-id: (optional uint),
    description: (string-utf8 500),
    filed-at: uint,
    status: (string-ascii 20),
    resolution: (optional (string-utf8 500)),
    resolved-at: (optional uint),
    arbiter: (optional principal)
  }
)

(define-map authorized-arbiters principal bool)

(define-map dispute-evidence
  { dispute-id: uint, evidence-id: uint }
  {
    submitter: principal,
    evidence-hash: (buff 32),
    submitted-at: uint
  }
)

(define-read-only (get-contract-owner)
  (ok (var-get contract-owner))
)

(define-read-only (get-dispute (dispute-id uint))
  (ok (map-get? disputes dispute-id))
)

(define-read-only (is-authorized-arbiter (arbiter principal))
  (ok (default-to false (map-get? authorized-arbiters arbiter)))
)

(define-read-only (get-dispute-nonce)
  (ok (var-get dispute-nonce))
)

(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (var-set contract-owner new-owner))
  )
)

(define-public (authorize-arbiter (arbiter principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (ok (map-set authorized-arbiters arbiter true))
  )
)

(define-public (file-dispute
  (respondent principal)
  (dispute-type (string-ascii 30))
  (work-id (optional uint))
  (description (string-utf8 500))
)
  (let ((dispute-id (+ (var-get dispute-nonce) u1)))
    (map-set disputes dispute-id {
      complainant: tx-sender,
      respondent: respondent,
      dispute-type: dispute-type,
      work-id: work-id,
      description: description,
      filed-at: stacks-block-height,
      status: "pending",
      resolution: none,
      resolved-at: none,
      arbiter: none
    })
    (var-set dispute-nonce dispute-id)
    (ok dispute-id)
  )
)

(define-public (assign-arbiter (dispute-id uint) (arbiter principal))
  (let ((dispute (unwrap! (map-get? disputes dispute-id) ERR_NOT_FOUND)))
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
    (asserts! (default-to false (map-get? authorized-arbiters arbiter)) ERR_UNAUTHORIZED)
    (ok (map-set disputes dispute-id (merge dispute { arbiter: (some arbiter), status: "in-review" })))
  )
)

(define-public (resolve-dispute
  (dispute-id uint)
  (resolution (string-utf8 500))
)
  (let ((dispute (unwrap! (map-get? disputes dispute-id) ERR_NOT_FOUND)))
    (asserts! (is-eq (some tx-sender) (get arbiter dispute)) ERR_UNAUTHORIZED)
    (ok (map-set disputes dispute-id (merge dispute {
      status: "resolved",
      resolution: (some resolution),
      resolved-at: (some stacks-block-height)
    })))
  )
)

(define-public (submit-evidence
  (dispute-id uint)
  (evidence-id uint)
  (evidence-hash (buff 32))
)
  (let ((dispute (unwrap! (map-get? disputes dispute-id) ERR_NOT_FOUND)))
    (ok (map-set dispute-evidence { dispute-id: dispute-id, evidence-id: evidence-id } {
      submitter: tx-sender,
      evidence-hash: evidence-hash,
      submitted-at: stacks-block-height
    }))
  )
)
