/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Related } from "./related";

const documents = [
  { title: "ruby", text: "this lorem ipsum blah foo" },
  { title: "ruby", text: "this document is about python." },
  { title: "ruby and node", text: "this document is about ruby and node." },
  {
    title: "examples",
    text: "this document is about node. it has node examples",
  },
];

let related: Related;
const options = {
  serializer: (document: any) => [document.title, document.text],
  weights: [1.0, 1],
};

beforeEach(() => {
  related = new Related(documents, options);
});

test("rank is correct with defaults", () => {
  expect(related.rank(documents[0])).toMatchInlineSnapshot(`
    Array [
      Object {
        "absolute": 1.7768564486857903,
        "document": Object {
          "text": "this document is about python.",
          "title": "ruby",
        },
        "relative": 0.12865726410284523,
      },
      Object {
        "absolute": 1.7768564486857903,
        "document": Object {
          "text": "this document is about ruby and node.",
          "title": "ruby and node",
        },
        "relative": 0.12865726410284523,
      },
      Object {
        "absolute": 0.7768564486857903,
        "document": Object {
          "text": "this document is about node. it has node examples",
          "title": "examples",
        },
        "relative": 0,
      },
    ]
  `);
});

test("should process correctly", () => {
  expect(related["process"](documents[0])).toMatchInlineSnapshot(`
    Array [
      Array [
        "rubi",
      ],
      Array [
        "thi",
        "lorem",
        "ipsum",
        "blah",
        "foo",
      ],
    ]
  `);
});

test("should not mutate documents", () => {
  related.rank(documents[1]);
  expect(documents).toEqual(related.documents);
});

test("should be able to use setters", () => {
  related.weights = [100, 100];
  related.serializer = related.serializer;
  related.tokenizer = related.tokenizer;
  related.stemmer = undefined;

  expect(related.rank(documents[1])[0].document.title).toMatchInlineSnapshot(
    `"ruby and node"`
  );
});

test("should return on already prepared", () => {
  related["prepare"]();
  related["stems_"] = [];
  related["prepare"]();
  expect(related.stems).toEqual([]);
});
