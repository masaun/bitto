(define-map identities principal {did: (string-ascii 128), public-key: (buff 33), verified: bool})
(define-map identity-proofs principal (list 10 (buff 64)))

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-IDENTITY-EXISTS (err u101))
(define-constant ERR-IDENTITY-NOT-FOUND (err u102))

(define-public (register-identity (did (string-ascii 128)) (public-key (buff 33)))
  (begin
    (asserts! (is-none (map-get? identities tx-sender)) ERR-IDENTITY-EXISTS)
    (ok (map-set identities tx-sender {did: did, public-key: public-key, verified: false}))))

(define-public (verify-identity)
  (let ((identity (unwrap! (map-get? identities tx-sender) ERR-IDENTITY-NOT-FOUND)))
    (ok (map-set identities tx-sender (merge identity {verified: true})))))

(define-public (add-proof (proof (buff 64)))
  (let ((proofs (default-to (list) (map-get? identity-proofs tx-sender))))
    (ok (map-set identity-proofs tx-sender (unwrap-panic (as-max-len? (append proofs proof) u10))))))

(define-read-only (get-identity (agent-id principal))
  (map-get? identities agent-id))

(define-read-only (get-proofs (agent-id principal))
  (map-get? identity-proofs agent-id))
