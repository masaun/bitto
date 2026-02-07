echo "Loading environment variables from ../../../../.env ..."
source ../../../../.env

echo "Running the script of the small-modular-nuclear-reactors.clar ..."
npx tsx small-modular-nuclear-reactors_batch-call_with-no-event-fetching.ts 
