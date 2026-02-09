(define-map swarms {swarm-id: uint} {leader: principal, size: uint, created-at: uint})
(define-map swarm-members {swarm-id: uint, member: principal} {role: (string-ascii 32), joined-at: uint})
(define-map member-list uint (list 50 principal))
(define-data-var swarm-counter uint u0)

(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-SWARM-NOT-FOUND (err u102))

(define-public (create-swarm)
  (let ((swarm-id (var-get swarm-counter)))
    (map-set swarms {swarm-id: swarm-id} {leader: tx-sender, size: u1, created-at: stacks-block-height})
    (var-set swarm-counter (+ swarm-id u1))
    (ok swarm-id)))

(define-public (join-swarm (swarm-id uint) (role (string-ascii 32)))
  (let ((swarm (unwrap! (map-get? swarms {swarm-id: swarm-id}) ERR-SWARM-NOT-FOUND))
        (members (default-to (list) (map-get? member-list swarm-id))))
    (map-set swarm-members {swarm-id: swarm-id, member: tx-sender} {role: role, joined-at: stacks-block-height})
    (map-set member-list swarm-id (unwrap-panic (as-max-len? (append members tx-sender) u50)))
    (ok (map-set swarms {swarm-id: swarm-id} (merge swarm {size: (+ (get size swarm) u1)})))))

(define-public (leave-swarm (swarm-id uint))
  (let ((swarm (unwrap! (map-get? swarms {swarm-id: swarm-id}) ERR-SWARM-NOT-FOUND)))
    (ok (map-delete swarm-members {swarm-id: swarm-id, member: tx-sender}))))

(define-read-only (get-swarm (swarm-id uint))
  (map-get? swarms {swarm-id: swarm-id}))

(define-read-only (get-member (swarm-id uint) (member principal))
  (map-get? swarm-members {swarm-id: swarm-id, member: member}))

(define-read-only (get-members (swarm-id uint))
  (map-get? member-list swarm-id))
