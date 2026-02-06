(define-map protected-processes (buff 32) {
  owner: principal,
  process-name: (string-utf8 256),
  protection-date: uint,
  expiry-date: uint,
  status: (string-ascii 20)
})

(define-read-only (get-protected-process (process-id (buff 32)))
  (map-get? protected-processes process-id))

(define-public (protect-process (process-id (buff 32)) (process-name (string-utf8 256)) (duration uint))
  (begin
    (asserts! (is-none (map-get? protected-processes process-id)) (err u1))
    (ok (map-set protected-processes process-id {
      owner: tx-sender,
      process-name: process-name,
      protection-date: stacks-block-height,
      expiry-date: (+ stacks-block-height duration),
      status: "protected"
    }))))
