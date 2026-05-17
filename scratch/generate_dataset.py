import json

data = [
    {"text": "react tutorial", "label": "frontend"},
    {"text": "css guide", "label": "frontend"},
    {"text": "html basics", "label": "frontend"},
    {"text": "vue documentation", "label": "frontend"},
    {"text": "javascript advanced", "label": "frontend"},
    {"text": "typescript handbook", "label": "frontend"},
    {"text": "next.js framework", "label": "frontend"},
    {"text": "tailwind css classes", "label": "frontend"},
    {"text": "redux state management", "label": "frontend"},
    {"text": "sass preprocessing", "label": "frontend"},
    {"text": "node js api", "label": "backend"},
    {"text": "express framework", "label": "backend"},
    {"text": "database setup", "label": "backend"},
    {"text": "postgresql tips", "label": "backend"},
    {"text": "mongodb query", "label": "backend"},
    {"text": "redis caching", "label": "backend"},
    {"text": "graphql schema", "label": "backend"},
    {"text": "restful api design", "label": "backend"},
    {"text": "django python", "label": "backend"},
    {"text": "laravel php", "label": "backend"},
    {"text": "docker containerization", "label": "devops"},
    {"text": "kubernetes cluster", "label": "devops"},
    {"text": "ci/cd pipeline", "label": "devops"},
    {"text": "aws cloud", "label": "devops"},
    {"text": "terraform infra", "label": "devops"},
    {"text": "nginx configuration", "label": "devops"},
    {"text": "jenkins automation", "label": "devops"},
    {"text": "git commands", "label": "devops"},
    {"text": "linux bash script", "label": "devops"},
    {"text": "monitoring prometheus", "label": "devops"},
    {"text": "machine learning basics", "label": "ai"},
    {"text": "deep learning tutorial", "label": "ai"},
    {"text": "neural networks", "label": "ai"},
    {"text": "gemini api integration", "label": "ai"},
    {"text": "nlp processing", "label": "ai"},
    {"text": "computer vision", "label": "ai"},
    {"text": "pytorch framework", "label": "ai"},
    {"text": "tensorflow models", "label": "ai"},
    {"text": "openai chatgpt", "label": "ai"},
    {"text": "data science pandas", "label": "ai"}
]

# Expand to 200 items with variations
variations = [
    "best {0} practices", "learning {0} from scratch", "advanced {0} tips", 
    "how to use {0} effectively", "{0} for beginners", "{0} project ideas",
    "top 10 {0} tools", "understanding {0} architecture", "{0} performance optimization",
    "the future of {0}", "comparing {0} vs other frameworks", "mastering {0}",
    "debugging {0} issues", "{0} security guide", "building with {0}"
]

expanded_data = []
for item in data:
    expanded_data.append(item)
    base_text = item["text"]
    label = item["label"]
    for var in variations:
        if len(expanded_data) >= 200:
            break
        expanded_data.append({"text": var.format(base_text), "label": label})
    if len(expanded_data) >= 200:
        break

with open("/home/tewodros-besha/Bookmarksaver with ai/ml-service/dataset.json", "w") as f:
    json.dump(expanded_data, f, indent=2)
