# related-documents

[![npm](https://img.shields.io/npm/v/related-documents)](https://www.npmjs.com/package/related-documents)
![Build](https://github.com/jpoehnelt/related-documents/workflows/Build/badge.svg)
![Release](https://github.com/jpoehnelt/related-documents/workflows/Release/badge.svg)
[![Docs](https://img.shields.io/badge/documentation-api-brightgreen)](https://jpoehnelt.github.io/related-documents/)

## Description

Rank text documents by similarity.

## Install

Install using NPM or similar.

```sh
npm i related-documents
```

## Usage

```js
import { Related } from "related-documents";

const documents = [
  { title: "ruby", text: "this lorem ipsum blah foo" },
  { title: "ruby", text: "this document is about python." },
  { title: "ruby and node", text: "this document is about ruby and node." },
  {
    title: "examples",
    text: "this document is about node. it has node examples",
  },
];

const options = {
  serializer: (document: any) => [document.title, document.text],
  weights: [10, 1],
};

const related = new Related(documents, options);

// Find documents related to document[0]
related.rank(documents[0]);
```

See the [reference documentation](https://jpoehnelt.github.io/related-documents/).
