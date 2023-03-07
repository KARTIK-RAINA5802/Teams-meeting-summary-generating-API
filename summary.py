# import re
# import math
# from transformers import pipeline
# from sklearn.metrics.pairwise import cosine_similarity
# from sklearn.feature_extraction.text import TfidfVectorizer
# from nltk.corpus import stopwords
# from nltk.tokenize import sent_tokenize
# import nltk
# nltk.download('punkt')
# nltk.download('stopwords')

# # input text
# text = """What is Deep Learning? Deep learning is a branch of machine learning which is completely based on artificial neural networks, as neural network is going to mimic the human brain so deep learning is also a kind of mimic of human brain. In deep learning, we don’t need to explicitly program everything. The concept of deep learning is not new. It has been around for a couple of years now. It’s on hype nowadays because earlier we did not have that much processing power and a lot of data. As in the last 20 years, the processing power increases exponentially, deep learning and machine learning came in the picture. A formal definition of deep learning is- neurons

# Virat Kohli is the best cricketer in the world. Even greats like Sachin and Ricky admire him. He has a record of 73 centuries.

# Humans have been, are, and will forever be thirsty to invent things that would make their lives easier and better by a thousandfold. The capacity of what a human mind can do has always baffled me. One such major invention would be what is called as AI- Artificial Intelligence. Wouldn’t it be great if machines could think? That’s precisely what AI is. We humans have natural intelligence. But if machines can think, it’d be artificial. So, AI is just a collective term for machines that can think.

# What-is-AI-Artificial-Intelligence

# Now here are some examples of AI in real life. Robots are what come to mind first. They are machine replicas of human beings. They can think for themselves, take important decisions on their own without human help. Not all artificially intelligent machines need to look like human beings though. Some of the other examples include self-driving cars or Amazon Alexa or even Siri. One other important application can be speech recognition. Remember how you ask google by speaking instead of typing what you have to search for, into the search bar? That’s one of the applications right there. There are so many more applications but let me get on to other topics.


# Artificial Intelligence (AI) is a branch of computer science that deals with the creation of intelligent machines that can perform tasks that typically require human intelligence. The goal of AI is to create algorithms and systems that can learn from data, reason, make predictions, and take actions.

# AI systems can be classified into two categories: narrow or weak AI, and general or strong AI. Narrow AI is designed to perform specific tasks, such as image recognition, speech recognition, or playing a game. On the other hand, general AI is capable of performing any intellectual task that a human can, including learning and problem-solving."""

# text_questions_remove = re.sub(r'^.*\? ', '', text)
# text = text_questions_remove

# text_sent_count = text.split(". ")
# text_sent_count = len(text_sent_count)
# # tokenize the text into sentences
# sentences = sent_tokenize(text)

# # remove stop words
# stop_words = stopwords.words('english')
# sentences_cleaned = []
# for sentence in sentences:
#     words = nltk.word_tokenize(sentence)
#     words_cleaned = [word.lower() for word in words if word.lower()
#                      not in stop_words and word.isalnum()]
#     sentences_cleaned.append(' '.join(words_cleaned))

# # create the TF-IDF matrix
# vectorizer = TfidfVectorizer()
# tfidf_matrix = vectorizer.fit_transform(sentences_cleaned)

# # calculate cosine similarity between sentences
# sentence_similarity = cosine_similarity(tfidf_matrix)

# # rank sentences based on similarity and select top sentences for summary
# num_sentences = math.floor(text_sent_count*0.9)
# sentence_scores = [(i, sum(sentence_similarity[i]))
#                    for i in range(len(sentences))]
# sentence_scores = sorted(sentence_scores, key=lambda x: x[1], reverse=True)
# selected_sentences = sorted([sentences[i]
#                             for i, score in sentence_scores[:num_sentences]])

# # generate the summary
# summary = ' '.join(selected_sentences)

# # print the summary
# # summarizer_summary = pipeline(
# #     "summarization", model="philschmid/bart-large-cnn-samsum")
# summarizer_summary = pipeline(
#     "summarization", model="philschmid/bart-large-cnn-samsum")


import sys
text = str(sys.argv[1])
print("the input text is: ", text)
