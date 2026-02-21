(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-voted (err u102))
(define-constant err-proposal-closed (err u103))

(define-map members principal {joined: uint, voting-power: uint, active: bool})
(define-map proposals uint {title: (string-ascii 50), votes-for: uint, votes-against: uint, end-block: uint, executed: bool})
(define-map votes {proposal-id: uint, voter: principal} {vote: bool, timestamp: uint})
(define-data-var proposal-nonce uint u0)
(define-data-var member-count uint u0)

(define-read-only (get-member (member principal))
  (map-get? members member))

(define-read-only (get-proposal (proposal-id uint))
  (map-get? proposals proposal-id))

(define-read-only (get-vote (proposal-id uint) (voter principal))
  (map-get? votes {proposal-id: proposal-id, voter: voter}))

(define-public (join-dao)
  (begin
    (asserts! (is-none (map-get? members tx-sender)) err-already-voted)
    (map-set members tx-sender {joined: burn-block-height, voting-power: u1, active: true})
    (var-set member-count (+ (var-get member-count) u1))
    (ok true)))

(define-public (create-proposal (title (string-ascii 50)) (duration uint))
  (let ((proposal-id (+ (var-get proposal-nonce) u1))
        (member (unwrap! (map-get? members tx-sender) err-not-found)))
    (asserts! (get active member) err-not-found)
    (map-set proposals proposal-id {title: title, votes-for: u0, votes-against: u0, end-block: (+ burn-block-height duration), executed: false})
    (var-set proposal-nonce proposal-id)
    (ok proposal-id)))

(define-public (vote-on-proposal (proposal-id uint) (vote-for bool))
  (let ((proposal (unwrap! (map-get? proposals proposal-id) err-not-found))
        (member (unwrap! (map-get? members tx-sender) err-not-found)))
    (asserts! (is-none (map-get? votes {proposal-id: proposal-id, voter: tx-sender})) err-already-voted)
    (asserts! (< burn-block-height (get end-block proposal)) err-proposal-closed)
    (if vote-for
      (map-set proposals proposal-id (merge proposal {votes-for: (+ (get votes-for proposal) (get voting-power member))}))
      (map-set proposals proposal-id (merge proposal {votes-against: (+ (get votes-against proposal) (get voting-power member))})))
    (map-set votes {proposal-id: proposal-id, voter: tx-sender} {vote: vote-for, timestamp: burn-block-height})
    (ok true)))

(define-public (execute-proposal (proposal-id uint))
  (let ((proposal (unwrap! (map-get? proposals proposal-id) err-not-found)))
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (>= burn-block-height (get end-block proposal)) err-proposal-closed)
    (map-set proposals proposal-id (merge proposal {executed: true}))
    (ok true)))
