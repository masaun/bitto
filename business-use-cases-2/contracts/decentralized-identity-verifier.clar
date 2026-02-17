(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))

(define-map identities principal {verified: bool, credential-hash: (buff 32), verified-at: uint})
(define-map verifiers principal bool)

(define-public (add-verifier (verifier principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ok (map-set verifiers verifier true))))

(define-public (verify-identity (user principal) (cred-hash (buff 32)))
  (begin
    (asserts! (default-to false (map-get? verifiers tx-sender)) err-owner-only)
    (ok (map-set identities user {verified: true, credential-hash: cred-hash, verified-at: stacks-block-height}))))

(define-read-only (get-identity (user principal))
  (ok (map-get? identities user)))

(define-read-only (is-verified (user principal))
  (ok (match (map-get? identities user)
    identity-data (get verified identity-data)
    false)))
