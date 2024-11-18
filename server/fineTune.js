const { AutoModelForCausalLM, AutoTokenizer, Trainer, TrainingArguments } = require('@huggingface/transformers');
const fs = require('fs');

async function loadModelAndTokenizer(modelId) {
    const model = await AutoModelForCausalLM.fromPretrained(modelId);
    const tokenizer = await AutoTokenizer.from_pretrained(modelId);
    return { model, tokenizer };
}

async function loadDataset(filePath) {
    const rawData = await fs.promises.readFile(filePath, 'utf8');
    const dataset = JSON.parse(rawData);

    return dataset.map(example => {
        const inputIds = tokenizer.encode(example.prompt, { addSpecialTokens: true });
        const labels = tokenizer.encode(example.response, { addSpecialTokens: true });
        
        return {
            input_ids: inputIds,
            labels: labels,
            attention_mask: Array(inputIds.length).fill(1) // Create attention mask
        };
    });
}

async function fineTuneModel(model, dataset) {
    const trainingArgs = new TrainingArguments({
        // output_dir: 'models/fine_tuned_model',
        output_dir: 'fine_tuned_model',
        per_device_train_batch_size: 2,
        num_train_epochs: 3,
        // logging_dir: 'models/logs',
        logging_dir: 'logs',
        save_total_limit: 2,
        evaluation_strategy: 'epoch',
        save_steps: 1000,
        gradient_accumulation_steps: 8,
    });

    const trainer = new Trainer(model, trainingArgs, dataset);
    await trainer.train();
}

async function main() {
    const modelId = 'llama3-groq-70b-8192-tool-use-preview';
    const { model, tokenizer } = await loadModelAndTokenizer(modelId);
    const dataset = await loadDataset('data/dataset.json');
    
    await fineTuneModel(model, dataset);
    console.log('Fine-tuning complete!');
}

main().catch(err => console.error(err));
