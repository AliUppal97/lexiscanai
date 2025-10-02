import json
import asyncio
from typing import Dict, List, Any
from dataclasses import dataclass
from pathlib import Path
import openai
from pydantic import BaseModel, ValidationError

@dataclass
class PromptTestResult:
    prompt_id: str
    sample_id: str
    success: bool
    precision: float
    recall: float
    hallucination_rate: float
    consistency_score: float
    error_message: str = None

class PromptEvaluator:
    def __init__(self, registry_path: str = "tests/prompts/registry.json"):
        self.registry_path = registry_path
        self.registry = self._load_registry()
        self.client = openai.OpenAI(api_key="your_openai_api_key")
    
    def _load_registry(self) -> Dict[str, Any]:
        with open(self.registry_path, 'r') as f:
            return json.load(f)
    
    async def evaluate_prompt(self, prompt_id: str, model_version: str = "v1") -> List[PromptTestResult]:
        """Evaluate a prompt against golden dataset"""
        results = []
        
        if prompt_id not in self.registry["prompts"]:
            raise ValueError(f"Prompt {prompt_id} not found in registry")
        
        prompt_config = self.registry["prompts"][prompt_id][model_version]
        
        # Find relevant golden datasets
        golden_datasets = self._find_golden_datasets(prompt_id)
        
        for dataset in golden_datasets:
            for sample in dataset["samples"]:
                result = await self._evaluate_sample(prompt_config, sample)
                results.append(result)
        
        return results
    
    def _find_golden_datasets(self, prompt_id: str) -> List[Dict[str, Any]]:
        """Find golden datasets relevant to the prompt"""
        relevant_datasets = []
        
        for dataset_name, dataset_config in self.registry["golden_datasets"].items():
            if self._is_relevant_dataset(prompt_id, dataset_name):
                relevant_datasets.append(dataset_config)
        
        return relevant_datasets
    
    def _is_relevant_dataset(self, prompt_id: str, dataset_name: str) -> bool:
        """Determine if a dataset is relevant to the prompt"""
        # Simple heuristic - can be made more sophisticated
        prompt_intent = self.registry["prompts"][prompt_id]["v1"]["intent"].lower()
        dataset_name_lower = dataset_name.lower()
        
        if "document" in prompt_intent and "sample" in dataset_name_lower:
            return True
        if "contract" in prompt_intent and "contract" in dataset_name_lower:
            return True
        
        return False
    
    async def _evaluate_sample(self, prompt_config: Dict[str, Any], sample: Dict[str, Any]) -> PromptTestResult:
        """Evaluate a single sample against the prompt"""
        try:
            # Load sample content
            sample_content = self._load_sample_content(sample["file_path"])
            
            # Run prompt
            response = await self._run_prompt(prompt_config, sample_content)
            
            # Validate output schema
            self._validate_output_schema(response, prompt_config["output_schema"])
            
            # Calculate metrics
            precision = self._calculate_precision(response, sample)
            recall = self._calculate_recall(response, sample)
            hallucination_rate = self._calculate_hallucination_rate(response, sample)
            consistency_score = self._calculate_consistency(response, sample)
            
            return PromptTestResult(
                prompt_id=prompt_config.get("id", "unknown"),
                sample_id=sample["id"],
                success=True,
                precision=precision,
                recall=recall,
                hallucination_rate=hallucination_rate,
                consistency_score=consistency_score
            )
            
        except Exception as e:
            return PromptTestResult(
                prompt_id=prompt_config.get("id", "unknown"),
                sample_id=sample["id"],
                success=False,
                precision=0.0,
                recall=0.0,
                hallucination_rate=1.0,
                consistency_score=0.0,
                error_message=str(e)
            )
    
    def _load_sample_content(self, file_path: str) -> str:
        """Load sample content from file"""
        full_path = Path("tests/prompts") / file_path
        return full_path.read_text(encoding='utf-8')
    
    async def _run_prompt(self, prompt_config: Dict[str, Any], content: str) -> Dict[str, Any]:
        """Run the prompt against the content"""
        template = prompt_config["template"]
        prompt_text = template.format(document_content=content)
        
        response = await self.client.chat.completions.create(
            model=prompt_config["model"],
            messages=[
                {"role": "system", "content": "You are a legal document analysis AI. Respond with valid JSON only."},
                {"role": "user", "content": prompt_text}
            ],
            temperature=0.1,
            max_tokens=2000
        )
        
        return json.loads(response.choices[0].message.content)
    
    def _validate_output_schema(self, response: Dict[str, Any], schema: Dict[str, Any]) -> bool:
        """Validate response against expected schema"""
        # This is a simplified validation - in production, use jsonschema library
        required_fields = schema.get("required", [])
        
        for field in required_fields:
            if field not in response:
                raise ValidationError(f"Missing required field: {field}")
        
        return True
    
    def _calculate_precision(self, response: Dict[str, Any], sample: Dict[str, Any]) -> float:
        """Calculate precision score"""
        # Simplified precision calculation
        expected_fields = ["risk_level", "missing_clauses"]
        correct_predictions = 0
        total_predictions = 0
        
        for field in expected_fields:
            if field in response and field in sample:
                if field == "risk_level":
                    if response[field] == sample[f"expected_{field}"]:
                        correct_predictions += 1
                    total_predictions += 1
                elif field == "missing_clauses":
                    # Compare arrays
                    response_clauses = set(response[field])
                    expected_clauses = set(sample[f"expected_{field}"])
                    
                    if response_clauses == expected_clauses:
                        correct_predictions += 1
                    total_predictions += 1
        
        return correct_predictions / total_predictions if total_predictions > 0 else 0.0
    
    def _calculate_recall(self, response: Dict[str, Any], sample: Dict[str, Any]) -> float:
        """Calculate recall score"""
        # Simplified recall calculation
        return self._calculate_precision(response, sample)  # Same for this example
    
    def _calculate_hallucination_rate(self, response: Dict[str, Any], sample: Dict[str, Any]) -> float:
        """Calculate hallucination rate"""
        # Simplified hallucination detection
        hallucination_indicators = ["unknown", "not specified", "not mentioned", "not found"]
        
        response_text = json.dumps(response).lower()
        hallucination_count = sum(1 for indicator in hallucination_indicators if indicator in response_text)
        
        return hallucination_count / len(hallucination_indicators)
    
    def _calculate_consistency(self, response: Dict[str, Any], sample: Dict[str, Any]) -> float:
        """Calculate consistency score"""
        # Simplified consistency calculation
        return 0.9  # Placeholder
    
    async def run_regression_tests(self) -> Dict[str, List[PromptTestResult]]:
        """Run regression tests for all prompts"""
        results = {}
        
        for prompt_id in self.registry["prompts"]:
            results[prompt_id] = await self.evaluate_prompt(prompt_id)
        
        return results
    
    def generate_report(self, results: Dict[str, List[PromptTestResult]]) -> str:
        """Generate evaluation report"""
        report = "# Prompt Evaluation Report\n\n"
        
        for prompt_id, prompt_results in results.items():
            report += f"## {prompt_id}\n\n"
            
            successful_tests = [r for r in prompt_results if r.success]
            failed_tests = [r for r in prompt_results if not r.success]
            
            if successful_tests:
                avg_precision = sum(r.precision for r in successful_tests) / len(successful_tests)
                avg_recall = sum(r.recall for r in successful_tests) / len(successful_tests)
                avg_hallucination = sum(r.hallucination_rate for r in successful_tests) / len(successful_tests)
                
                report += f"- **Tests Passed**: {len(successful_tests)}/{len(prompt_results)}\n"
                report += f"- **Average Precision**: {avg_precision:.2f}\n"
                report += f"- **Average Recall**: {avg_recall:.2f}\n"
                report += f"- **Average Hallucination Rate**: {avg_hallucination:.2f}\n\n"
            
            if failed_tests:
                report += f"### Failed Tests\n\n"
                for test in failed_tests:
                    report += f"- **Sample {test.sample_id}**: {test.error_message}\n"
                report += "\n"
        
        return report

# CLI interface
async def main():
    evaluator = PromptEvaluator()
    
    print("Running prompt regression tests...")
    results = await evaluator.run_regression_tests()
    
    report = evaluator.generate_report(results)
    
    # Save report
    with open("tests/prompts/evaluation_report.md", "w") as f:
        f.write(report)
    
    print("Evaluation complete. Report saved to tests/prompts/evaluation_report.md")

if __name__ == "__main__":
    asyncio.run(main())
