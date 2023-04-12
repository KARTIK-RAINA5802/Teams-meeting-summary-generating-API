import nltk
from nltk.tokenize import sent_tokenize
from nltk.corpus import stopwords
from transformers import pipeline
import math
import re
import sys
nltk.download("punkt")
nltk.download("stopwords")

text = str(sys.argv[1])

text_questions_remove = re.sub(r'^.*\? ','',text)

text = text_questions_remove
# summarizer_summary = pipeline("summarization", model="philschmid/bart-large-cnn-samsum")
summarizer_summary = pipeline("summarization", model="facebook/bart-large-cnn")
    
# Original text to summarize

def chunk_text(text, max_chunk_len=512):
    chunks = []
    words = text.split()
    current_chunk = words[0]
    for word in words[1:]:
        if len(current_chunk) + len(word) + 1 <= max_chunk_len:
            current_chunk += " " + word
        else:
            last_period = current_chunk.rfind(".")
            if last_period == -1:
                chunks.append(current_chunk)
                current_chunk = word
            else:
                chunks.append(current_chunk[:last_period+1])
                current_chunk = current_chunk[last_period+1:] + " " + word
    if current_chunk:
        chunks.append(current_chunk)
    else:
        chunks[-1] += " " + words[-1]
        if len(chunks[-1]) > max_chunk_len:
            last_period = chunks[-1][:max_chunk_len].rfind(".")
            chunks[-1] = chunks[-1][:last_period+1]
    return chunks


chunks = chunk_text(text)
chunks_length = len(chunks)
# chunks = chunks[0:int(chunks_length*0.8)]
# chunks_length = len(chunks)

z = ""
for i in range(int(math.floor(chunks_length)*0.7)):
    max_len = int(math.floor((len(chunks[i].split()))*0.8))
    summary = summarizer_summary(chunks[i], max_length=max_len, min_length=max_len//2, do_sample=False)
    # summary = model(chunks[i], max_length=max_len, min_length=max_len//2, do_sample=False)
    sentences = []
    for item in summary:
        finally_summary_final = item['summary_text']
        sentences.extend(nltk.sent_tokenize(finally_summary_final))
    sentences = ' '.join(sentences)
    z += (str(sentences))
print(z)
