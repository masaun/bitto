echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the robot-to-robot-communication-network.clar ..."
npx tsx robot-to-robot-communication-network_batch-call_with-no-event-fetching.ts 
