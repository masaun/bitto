(define-map separation-tech-ip (buff 32) {
  inventor: principal,
  technology-name: (string-utf8 256),
  filing-date: uint,
  patent-status: (string-ascii 20),
  expiry-date: uint
})

(define-read-only (get-separation-tech (ip-id (buff 32)))
  (map-get? separation-tech-ip ip-id))

(define-public (register-separation-tech (ip-id (buff 32)) (technology-name (string-utf8 256)) (duration uint))
  (begin
    (asserts! (is-none (map-get? separation-tech-ip ip-id)) (err u1))
    (ok (map-set separation-tech-ip ip-id {
      inventor: tx-sender,
      technology-name: technology-name,
      filing-date: stacks-block-height,
      patent-status: "pending",
      expiry-date: (+ stacks-block-height duration)
    }))))

(define-public (update-patent-status (ip-id (buff 32)) (patent-status (string-ascii 20)))
  (begin
    (asserts! (is-some (map-get? separation-tech-ip ip-id)) (err u2))
    (let ((tech (unwrap-panic (map-get? separation-tech-ip ip-id))))
      (asserts! (is-eq tx-sender (get inventor tech)) (err u1))
      (ok (map-set separation-tech-ip ip-id (merge tech { patent-status: patent-status }))))))
