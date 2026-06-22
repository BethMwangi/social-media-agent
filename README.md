# social-media-agent

```text
social-media-agent/
├── apps/
│   ├── web/
│   └── api/
│
├── docs/
│
├── n8n/
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

## Run the API

Use the repo launcher so the API always starts from `apps/api` with that folder's virtual environment:

```sh
./scripts/run-api.sh
```

You can also run the `Run API` VS Code task, which uses the same launcher.
