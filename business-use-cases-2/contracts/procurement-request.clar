(define-map requests 
  uint 
  {
    requester: principal,
    title: (string-ascii 128),
    requirements: (string-ascii 512),
    deadline: uint,
    status: (string-ascii 20)
  }
)

(define-data-var request-nonce uint u0)

(define-read-only (get-request (id uint))
  (map-get? requests id)
)

(define-public (create-request (title (string-ascii 128)) (requirements (string-ascii 512)) (deadline uint))
  (let ((id (+ (var-get request-nonce) u1)))
    (map-set requests id {
      requester: tx-sender,
      title: title,
      requirements: requirements,
      deadline: deadline,
      status: "active"
    })
    (var-set request-nonce id)
    (ok id)
  )
)
