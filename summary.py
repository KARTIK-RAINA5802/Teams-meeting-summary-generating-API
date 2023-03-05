import sys
# print ("Hello", str(sys.argv[1]))
# text = str(sys.argv[1]);
# print(text)


import tensorflow as tf
import tensorflow_datasets as tfds
import transformers
from transformers import T5ForConditionalGeneration, T5Tokenizer
import sys
import math
import nltk
nltk.download('vader_lexicon')
from nltk.tokenize import sent_tokenize
# from nltk.sentiment import SentimentIntensityAnalyzer
from collections import Counter
import spacy
import pytextrank

nlp = spacy.load('en_core_web_lg')  # load the pre-trained medium-sized English model

example_text = str(sys.argv[1])
example_text = " ".join(example_text.strip().split())
sentences = example_text.split(". ")

unique_sentences = []

for i, sentence in enumerate(sentences):
    if i == 0:
        unique_sentences.append(sentence)  # always keep the first sentence
    else:
        # compare the current sentence to all previous sentences
        is_duplicate = False
        for prev_sentence in unique_sentences:
            similarity = nlp(prev_sentence).similarity(nlp(sentence))
            if similarity > 0.9:  # adjust the threshold as needed
                is_duplicate = True
                break
        if not is_duplicate:
            unique_sentences.append(sentence)

# join the unique sentences back into a paragraph
unique_paragraph = '. '.join(unique_sentences)

unique_sent = sent_tokenize(unique_paragraph)
num_sentence = len(unique_sent)
num_sentence= num_sentence-(math.floor(num_sentence*0.3))


nlp = spacy.load("en_core_web_lg")
nlp.add_pipe("textrank")
doc = nlp(unique_paragraph)
ext = []
for sent in doc._.textrank.summary(limit_phrases=1, limit_sentences=num_sentence):
    ext.append(str(sent))
ext = " ".join(ext)
print(ext)