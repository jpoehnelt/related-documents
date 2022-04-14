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

import { PorterStemmer, WordTokenizer, TfIdf } from "natural";
import type { Stemmer, Tokenizer } from "natural";

export type serializer = (item: any) => string[];

export interface Options {
  serializer: serializer;
  weights: number[];
  stemmer?: Stemmer;
  tokenizer?: Tokenizer;
}

export class Related {
  private stems_: string[][][];
  private tfidfs_: TfIdf[];
  private documents_: any;
  private options_: Options;
  private debug = false;

  constructor(documents: any[], options: Options) {
    this.documents_ = documents;
    this.options_ = {
      stemmer: PorterStemmer,
      tokenizer: new WordTokenizer(),
      ...options,
    };
  }

  get documents() {
    return this.documents_;
  }

  get weights() {
    return this.options_.weights ?? Array(this.numParts).fill(1);
  }

  set weights(weights: number[]) {
    this.options_.weights = weights;
  }

  get numParts() {
    return this.serialize(this.documents[0]).length;
  }

  get stems() {
    return this.stems_;
  }

  get tfidfs() {
    return this.tfidfs_;
  }

  get serializer() {
    return this.options_.serializer;
  }

  set serializer(serializer: serializer) {
    this.reset();
    this.options_.serializer = serializer;
  }

  get tokenizer() {
    return this.options_.tokenizer;
  }

  set tokenizer(tokenizer: Tokenizer) {
    this.reset();
    this.options_.tokenizer = tokenizer;
  }

  get stemmer() {
    return this.options_.stemmer;
  }

  set stemmer(stemmer: Stemmer | undefined) {
    this.reset();
    this.options_.stemmer = stemmer;
  }

  private reset() {
    this.stems_ = null;
    this.tfidfs_ = null;
  }

  private prepare() {
    if (this.stems_ && this.tfidfs_) {
      return;
    }


    // documents -> parts -> words -> stems
    this.stems_ = this.documents_.map((item) => this.process(item));
    this.tfidfs_ = [];

    for (let i = 0; i < this.numParts; i++) {
      this.tfidfs_.push(new TfIdf());
      // add the documents
      for (let parts of this.stems_) {
        this.tfidfs_[i].addDocument(parts[i]);
      }
    }
  }

  /**
   * Serialize according the {@link Options.serializer} where an object is
   * serialized into an array of strings based upon specific parts of the
   * document such as `title`, `summary`, etc.
   */
  serialize(document: any): string[] {
    return this.serializer(document);
  }

  /**
   * Tokenize the individual serialized parts of the document.
   */
  tokenize(parts: string[]): string[][] {
    return parts.map((part) => this.tokenizer.tokenize(part));
  }

  /**
   * Run the stemmer over the words.
   */
  stem(parts: string[][]): string[][] {
    if (this.stemmer) {
      return parts.map(words => words.map((w) => this.stemmer.stem(w)));
    } else {
      return parts;
    }
  }

  /**
   * Convert the document into parts, each having an array of stems or words
   */
  private process(document: any): string[][] {
    const serialized = this.serialize(document);
    const tokens = this.tokenize(serialized);
    const stems = this.stem(tokens);

    if (this.debug) {
      console.log({ serialized, tokens, stems })
    }

    return stems;
  }

  public rank(document: any): { relative: number; absolute: number, document: any }[] {
    this.prepare();

    const documentStems = this.process(document);
    const measures: number[] = Array(this.documents.length).fill(0);

    this.weights.forEach((w, i) => {
      this.tfidfs[i].tfidfs(documentStems[i], (j, measure) => {
        measures[j] += measure * w;
      });
    });

    const scores = measures
      .map((score, i) => ({ score, document: this.documents_[i] }))
      .sort((a, b) => b.score - a.score)

    const max = scores[0].score;
    const min = scores[scores.length - 1].score;

    return scores.map(({ score, document }) => ({ relative: (score - min) / (max - min), absolute: score, document })).slice(1, measures.length)
  }
}

export const closure = (options: Options) => {

  return (document, documents) => {
    let related: Related;

    if (!related || !shallowIsEqual(documents, related.documents)) {
      related = new Related(documents, options);
    }

    return related.rank(document);
  };
};

const shallowIsEqual = (a: any[], b: any[]): boolean => {
  if (a.length !== b.length) { return false; }

  for (let i = 0; i < a.length; i++) {
    if (a !== b) {
      return false
    }
  }

  return true;
}
