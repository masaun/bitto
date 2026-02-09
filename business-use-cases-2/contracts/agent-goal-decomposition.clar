(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-ALREADY-EXISTS (err u101))
(define-constant ERR-NOT-FOUND (err u102))
(define-constant ERR-INVALID-PARAMETER (err u103))

(define-map goals uint {parent: uint, owner: principal, description: (string-ascii 256), level: uint, completed: bool})
(define-data-var goal-nonce uint u0)

(define-public (create-goal (parent uint) (description (string-ascii 256)) (level uint))
  (let ((goal-id (+ (var-get goal-nonce) u1)))
    (asserts! (> level u0) ERR-INVALID-PARAMETER)
    (map-set goals goal-id {parent: parent, owner: tx-sender, description: description, level: level, completed: false})
    (var-set goal-nonce goal-id)
    (ok goal-id)))

(define-public (mark-completed (goal-id uint))
  (let ((goal (unwrap! (map-get? goals goal-id) ERR-NOT-FOUND)))
    (asserts! (is-eq (get owner goal) tx-sender) ERR-NOT-AUTHORIZED)
    (ok (map-set goals goal-id (merge goal {completed: true})))))

(define-read-only (get-goal (goal-id uint))
  (ok (map-get? goals goal-id)))
