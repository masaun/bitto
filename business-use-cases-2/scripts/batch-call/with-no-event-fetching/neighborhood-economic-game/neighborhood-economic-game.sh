echo "Load environment variables"
if [ -f ../../../../.env ]; then
    source ../../../../.env
else
    echo "Error: .env file not found at ../../../../.env"
    exit 1
fi

echo "Run the neighborhood-economic-game_batch-call_with-no-event-fetching.ts" 
npx tsx ./neighborhood-economic-game_batch-call_with-no-event-fetching.ts