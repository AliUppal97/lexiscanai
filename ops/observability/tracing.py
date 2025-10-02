# OpenTelemetry Configuration for LexiScan AI

import os
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.resources import Resource
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.instrumentation.psycopg2 import Psycopg2Instrumentor
from opentelemetry.instrumentation.redis import RedisInstrumentor

def setup_tracing():
    """Setup OpenTelemetry tracing for the application"""
    
    # Create resource with service information
    resource = Resource.create({
        "service.name": "lexiscan-ai-worker",
        "service.version": os.getenv("SERVICE_VERSION", "1.0.0"),
        "deployment.environment": os.getenv("ENVIRONMENT", "development"),
    })
    
    # Create tracer provider
    tracer_provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(tracer_provider)
    
    # Configure OTLP exporter
    otlp_exporter = OTLPSpanExporter(
        endpoint=os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT", "http://localhost:4317"),
        headers={
            "api-key": os.getenv("DATADOG_API_KEY", ""),
        }
    )
    
    # Add span processor
    span_processor = BatchSpanProcessor(otlp_exporter)
    tracer_provider.add_span_processor(span_processor)
    
    # Instrument libraries
    FastAPIInstrumentor.instrument()
    RequestsInstrumentor.instrument()
    Psycopg2Instrumentor.instrument()
    RedisInstrumentor.instrument()
    
    return tracer_provider

def get_tracer(name: str):
    """Get a tracer instance"""
    return trace.get_tracer(name)

# Usage example:
# tracer = get_tracer(__name__)
# with tracer.start_as_current_span("process_document") as span:
#     span.set_attribute("document.id", document_id)
#     span.set_attribute("document.type", mime_type)
#     # ... processing logic
