(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-params (err u103))

(define-map media-rights
  {rights-id: uint}
  {
    content-type: (string-ascii 64),
    owner: principal,
    territory: (string-ascii 128),
    duration-blocks: uint,
    value: uint,
    granted-to: (optional principal),
    status: (string-ascii 16),
    created-at: uint
  }
)

(define-map rights-agreements
  {agreement-id: uint}
  {
    rights-id: uint,
    licensee: principal,
    fee: uint,
    start-height: uint,
    end-height: uint,
    status: (string-ascii 16)
  }
)

(define-data-var rights-nonce uint u0)
(define-data-var agreement-nonce uint u0)

(define-read-only (get-media-rights (rights-id uint))
  (map-get? media-rights {rights-id: rights-id})
)

(define-read-only (get-agreement (agreement-id uint))
  (map-get? rights-agreements {agreement-id: agreement-id})
)

(define-public (register-media-rights
  (content-type (string-ascii 64))
  (territory (string-ascii 128))
  (duration-blocks uint)
  (value uint)
)
  (let ((rights-id (var-get rights-nonce)))
    (asserts! (> value u0) err-invalid-params)
    (map-set media-rights {rights-id: rights-id}
      {
        content-type: content-type,
        owner: tx-sender,
        territory: territory,
        duration-blocks: duration-blocks,
        value: value,
        granted-to: none,
        status: "available",
        created-at: stacks-block-height
      }
    )
    (var-set rights-nonce (+ rights-id u1))
    (ok rights-id)
  )
)

(define-public (create-agreement
  (rights-id uint)
  (licensee principal)
  (fee uint)
  (duration uint)
)
  (let (
    (rights (unwrap! (map-get? media-rights {rights-id: rights-id}) err-not-found))
    (agreement-id (var-get agreement-nonce))
  )
    (asserts! (is-eq tx-sender (get owner rights)) err-unauthorized)
    (asserts! (is-eq (get status rights) "available") err-invalid-params)
    (map-set rights-agreements {agreement-id: agreement-id}
      {
        rights-id: rights-id,
        licensee: licensee,
        fee: fee,
        start-height: stacks-block-height,
        end-height: (+ stacks-block-height duration),
        status: "active"
      }
    )
    (map-set media-rights {rights-id: rights-id}
      (merge rights {granted-to: (some licensee), status: "licensed"})
    )
    (var-set agreement-nonce (+ agreement-id u1))
    (ok agreement-id)
  )
)
