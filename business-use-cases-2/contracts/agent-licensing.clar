(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map licenses uint {agent-id: uint, licensee: principal, license-type: (string-ascii 32), expiry: uint})
(define-data-var license-nonce uint u0)

(define-public (issue-license (agent-id uint) (licensee principal) (license-type (string-ascii 32)) (expiry uint))
  (let ((license-id (+ (var-get license-nonce) u1)))
    (asserts! (> expiry stacks-block-height) ERR-INVALID-PARAMETER)
    (map-set licenses license-id {agent-id: agent-id, licensee: licensee, license-type: license-type, expiry: expiry})
    (var-set license-nonce license-id)
    (ok license-id)))

(define-read-only (get-license (license-id uint))
  (ok (map-get? licenses license-id)))
