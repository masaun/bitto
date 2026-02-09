(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map kill-switches principal {enabled: bool, activated: bool, reason: (string-ascii 128)})

(define-public (enable-kill-switch)
  (ok (map-set kill-switches tx-sender {enabled: true, activated: false, reason: ""})))

(define-public (activate-kill-switch (reason (string-ascii 128)))
  (let ((ks (unwrap! (map-get? kill-switches tx-sender) ERR-NOT-FOUND)))
    (asserts! (get enabled ks) ERR-INVALID-PARAMETER)
    (ok (map-set kill-switches tx-sender {enabled: true, activated: true, reason: reason}))))

(define-read-only (get-kill-switch (agent principal))
  (ok (map-get? kill-switches agent)))
