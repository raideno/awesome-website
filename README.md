# Awesome Website

**NOTE:** To easily deploy an awesome list; Use the [**Template Repository**](https://github.com/raideno/easy-awesome-website).

This repository contains the source code for "Awesome Website", a project that transforms a simple YAML file into a beautiful, interactive, and easily deployable website. It's the perfect solution for creating and maintaining "awesome lists" with a polished and professional look.

**Demo:** [https://raideno.github.io/awesome-website](https://raideno.github.io/awesome-website/)

![website-preview](./assets/preview.png)

## Getting Started

To create your own awesome list website, you'll need to fork this repository and modify the `example.list.yaml` file.

### Usage

```yaml
name: Deploy Awesome Website to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - name: checkout repository
        uses: actions/checkout@v4

      - name: build awesome website
        uses: raideno/awesome-website@main
        with:
          # Formatted according to the structure specified below
          yaml-path: 'example.list.yaml'

      - name: upload build artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: awesome-website-src/dist
          name: github-pages

      - name: deploy to github pages
        id: deployment
        uses: actions/deploy-pages@v4
        with:
          artifact_name: github-pages

```

1. **Create a GitHub repository.**
2. **Create List File:** Copy [`example.list.yaml`](./example.list.yaml) into your repository.
3. **Customize your list:** Edit the `example.list.yaml` file to add your own title, description, and list of resources. See the [YAML File Structure](#yaml-file-structure) section below for a detailed explanation of the available fields.
4. **Enable GitHub Pages:** In your repository's settings, go to the "Pages" section and select "GitHub Actions" as the source. This will trigger the deployment workflow.
5. **Create Workflow file:** Copy [.github/workflows/deploy-awesome-website.yml](./.github/workflows/deploy-awesome-website.yml) into your repository.
6. **Finally:** Push your changes and wait for the github action to complete in order to see your changes.

Your new awesome list website will be available at `https://<your-username>.github.io/<your-repository-name>/`.

## YAML File Structure

The `example.list.yaml` file has a clear structure that's easy to understand and modify. Below is a breakdown of each section and its purpose.

| Field         | Type                 | Description                                                             |
| :------------ | :------------------- | :---------------------------------------------------------------------- |
| `title`       | String               | The main title of your awesome list.                                    |
| `description` | String               | A short description of your list that will appear in the header.        |
| `author`      | String               | The name of the primary author of the list.                             |
| `thumbnail`   | URL                  | An optional URL for a thumbnail image to be displayed in the header.    |
| `links`       | Array of Url Strings | A list of additional links to be displayed in the header.               |
| `elements`    | Array of Objects     | The core of your awesome list, where each object represents a resource. |


### Element Object Structure

| Field         | Type                 | Description                                                                      |
| :------------ | :------------------- | :------------------------------------------------------------------------------- |
| `name`        | String               | The name of the resource.                                                        |
| `description` | String               | A short description of the resource.                                             |
| `links`       | Array of Url Strings | A list of relevant URLs for the resource (e.g., website, GitHub, documentation). |
| `tags`        | Array of Strings     | A list of tags specific to this resource for filtering.                          |

## Deployment

This project includes a GitHub Actions workflow that automatically builds and deploys your website to GitHub Pages. The workflow is triggered every time you push a change to the `main` branch.

To enable automated deployments, make sure to configure GitHub Pages to use the "GitHub Actions" source in your repository's settings.

## Contribution & Development

Copy the [`.env.example`](./.env.example) file to `.env` and fill in the required values.

- Development: `npm run dev`
- Build: `npm run build`
- Start Build: `npm run start`

Do your changes in a separate branch and create a pull request to merge them into the `main` branch or `develop` branch if you are working on a feature.

# TODOs

- [ ] When clicking on a card or on multiple ones it should get selected, shift clicking when some card is already selected should select the in between; ctrl+click should also be possible.
- [ ] Have a README version of the list automatically generated as well.
- [ ] Auto generate contributors list.
- [ ] Add an LLM version where it is possible to provide a github url and the LLM scrape it to generate a .yaml file from it.

- [ ] Externalize the pushing library to a separate package.
- [ ] Use the package to build a more general storage website, capable of storing files, images, videos, etc for personal use. A sort of cloud.
