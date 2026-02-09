(define-map priority-queue {queue-id: uint, position: uint} {task-id: uint, priority: uint, agent: principal})
(define-map queue-size uint uint)
(define-data-var queue-counter uint u0)

(define-constant ERR-QUEUE-NOT-FOUND (err u102))
(define-constant ERR-INVALID-POSITION (err u107))

(define-public (create-queue)
  (let ((queue-id (var-get queue-counter)))
    (map-set queue-size queue-id u0)
    (var-set queue-counter (+ queue-id u1))
    (ok queue-id)))

(define-public (enqueue (queue-id uint) (task-id uint) (priority uint))
  (let ((size (default-to u0 (map-get? queue-size queue-id))))
    (map-set priority-queue {queue-id: queue-id, position: size} {task-id: task-id, priority: priority, agent: tx-sender})
    (map-set queue-size queue-id (+ size u1))
    (ok size)))

(define-public (dequeue (queue-id uint) (position uint))
  (let ((size (default-to u0 (map-get? queue-size queue-id))))
    (asserts! (< position size) ERR-INVALID-POSITION)
    (ok (map-delete priority-queue {queue-id: queue-id, position: position}))))

(define-read-only (get-queue-item (queue-id uint) (position uint))
  (map-get? priority-queue {queue-id: queue-id, position: position}))

(define-read-only (get-queue-size (queue-id uint))
  (map-get? queue-size queue-id))
