(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u100))

(define-map credentials (buff 32) {holder: principal, issuer: principal, credential-type: (string-ascii 32), issued-at: uint})
(define-map issuers principal bool)

(define-public (add-issuer (issuer principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (ok (map-set issuers issuer true))))

(define-public (issue-credential (holder principal) (cred-hash (buff 32)) (cred-type (string-ascii 32)))
  (begin
    (asserts! (default-to false (map-get? issuers tx-sender)) err-unauthorized)
    (ok (map-set credentials cred-hash {holder: holder, issuer: tx-sender, credential-type: cred-type, issued-at: stacks-block-height}))))

(define-read-only (get-credential (cred-hash (buff 32)))
  (ok (map-get? credentials cred-hash)))

(define-read-only (is-issuer (issuer principal))
  (ok (default-to false (map-get? issuers issuer))))
