(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-data-not-found (err u102))
(define-constant err-access-denied (err u103))

(define-map datasets uint {
  name: (string-ascii 100),
  owner: principal,
  data-hash: (buff 32),
  public: bool,
  category: (string-ascii 50)
})

(define-map access-permissions {dataset-id: uint, requester: principal} {
  granted: bool,
  expiry: uint
})

(define-map data-requests uint {
  dataset-id: uint,
  requester: principal,
  purpose: (string-ascii 200),
  status: (string-ascii 20)
})

(define-data-var dataset-nonce uint u0)
(define-data-var request-nonce uint u0)

(define-read-only (get-dataset (dataset-id uint))
  (ok (map-get? datasets dataset-id)))

(define-read-only (has-access (dataset-id uint) (requester principal))
  (let ((permission (map-get? access-permissions {dataset-id: dataset-id, requester: requester})))
    (match permission
      perm (and (get granted perm) (> (get expiry perm) stacks-block-height))
      false)))

(define-public (register-dataset (name (string-ascii 100)) (data-hash (buff 32)) (public bool) (category (string-ascii 50)))
  (let ((dataset-id (+ (var-get dataset-nonce) u1)))
    (map-set datasets dataset-id {
      name: name,
      owner: tx-sender,
      data-hash: data-hash,
      public: public,
      category: category
    })
    (var-set dataset-nonce dataset-id)
    (ok dataset-id)))

(define-public (request-access (dataset-id uint) (purpose (string-ascii 200)))
  (let ((request-id (+ (var-get request-nonce) u1)))
    (map-set data-requests request-id {
      dataset-id: dataset-id,
      requester: tx-sender,
      purpose: purpose,
      status: "pending"
    })
    (var-set request-nonce request-id)
    (ok request-id)))

(define-public (grant-access (dataset-id uint) (requester principal) (duration uint))
  (let ((dataset (unwrap! (map-get? datasets dataset-id) err-data-not-found)))
    (asserts! (is-eq tx-sender (get owner dataset)) err-not-authorized)
    (ok (map-set access-permissions {dataset-id: dataset-id, requester: requester} {
      granted: true,
      expiry: (+ stacks-block-height duration)
    }))))

(define-public (revoke-access (dataset-id uint) (requester principal))
  (let ((dataset (unwrap! (map-get? datasets dataset-id) err-data-not-found)))
    (asserts! (is-eq tx-sender (get owner dataset)) err-not-authorized)
    (ok (map-delete access-permissions {dataset-id: dataset-id, requester: requester}))))
