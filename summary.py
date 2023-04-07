import nltk
from nltk.tokenize import sent_tokenize
from nltk.corpus import stopwords
# from sklearn.feature_extraction.text import TfidfVectorizer
# from sklearn.metrics.pairwise import cosine_similarity
from transformers import pipeline
import math
import re
import sys
nltk.download("punkt")
nltk.download("stopwords")

# # input text
# text = """What is Deep Learning? Deep learning is a branch of machine learning which is completely based on artificial neural networks, as neural network is going to mimic the human brain so deep learning is also a kind of mimic of human brain. In deep learning, we don’t need to explicitly program everything. The concept of deep learning is not new. It has been around for a couple of years now. It’s on hype nowadays because earlier we did not have that much processing power and a lot of data. As in the last 20 years, the processing power increases exponentially, deep learning and machine learning came in the picture. A formal definition of deep learning is- neurons.

# Virat Kohli is the best cricketer in the world. Even greats like Sachin and Ricky admire him. He has a record of 73 centuries.

# Humans have been, are, and will forever be thirsty to invent things that would make their lives easier and better by a thousandfold. The capacity of what a human mind can do has always baffled me. One such major invention would be what is called as AI- Artificial Intelligence. Wouldn’t it be great if machines could think? That’s precisely what AI is. We humans have natural intelligence. But if machines can think, it’d be artificial. So, AI is just a collective term for machines that can think. 

# Now here are some examples of AI in real life. Robots are what come to mind first. They are machine replicas of human beings. They can think for themselves, take important decisions on their own without human help. Not all artificially intelligent machines need to look like human beings though. Some of the other examples include self-driving cars or Amazon Alexa or even Siri. One other important application can be speech recognition. Remember how you ask google by speaking instead of typing what you have to search for, into the search bar? That’s one of the applications right there. There are so many more applications but let me get on to other topics. 

# Artificial Intelligence (AI) is a branch of computer science that deals with the creation of intelligent machines that can perform tasks that typically require human intelligence. The goal of AI is to create algorithms and systems that can learn from data, reason, make predictions, and take actions.
# """

text = str(sys.argv[1])

text_questions_remove = re.sub(r'^.*\? ','',text)
text = text_questions_remove
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

z = ""
# final_summary = []
for i in range(int(math.floor(chunks_length)*0.7)):
    max_len = int(math.floor((len(chunks[i].split()))*0.8))
    # Generate summary with 30% length of original text
    summary = summarizer_summary(chunks[i], max_length=max_len, min_length=max_len//2, do_sample=False)
    sentences = []
    for item in summary:
        finally_summary_final = item['summary_text']
        sentences.extend(nltk.sent_tokenize(finally_summary_final))
    sentences = ' '.join(sentences)
    z += (str(sentences))
print(z)
# Print the summary
# print(final_summary)

