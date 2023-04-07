import nltk
import sys
from nltk.tokenize import word_tokenize, sent_tokenize
from gensim.models import TfidfModel
from gensim.corpora import Dictionary
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.cluster import AgglomerativeClustering

# Initialize sentence transformer model
model = SentenceTransformer('distilbert-base-nli-mean-tokens')

text = str(sys.argv[1])

# text = """What is Deep Learning? Deep learning is a branch of machine learning which is completely based on artificial neural networks, as neural network is going to mimic the human brain so deep learning is also a kind of mimic of human brain. In deep learning, we don’t need to explicitly program everything. The concept of deep learning is not new. It has been around for a couple of years now. It’s on hype nowadays because earlier we did not have that much processing power and a lot of data. As in the last 20 years, the processing power increases exponentially, deep learning and machine learning came in the picture. A formal definition of deep learning is- neurons.

# Virat Kohli is the best cricketer in the world. Even greats like Sachin and Ricky admire him. He has a record of 73 centuries.

# Humans have been, are, and will forever be thirsty to invent things that would make their lives easier and better by a thousandfold. The capacity of what a human mind can do has always baffled me. One such major invention would be what is called as AI- Artificial Intelligence. Wouldn’t it be great if machines could think? That’s precisely what AI is. We humans have natural intelligence. But if machines can think, it’d be artificial. So, AI is just a collective term for machines that can think.
# Modi was appointed Chief Minister of Gujarat in 2001 due to Keshubhai Patel's failing health and poor public image following the earthquake in Bhuj. Modi was elected to the legislative assembly soon after. His administration has been considered complicit in the 2002 Gujarat riots in which 1044 people were killed, three-quarters of whom were Muslim,[d] or otherwise criticised for its management of the crisis. A Special Investigation Team appointed by the Supreme Court of India found no evidence to initiate prosecution proceedings against Modi personally.[e] While his policies as chief minister—credited with encouraging economic growth—have received praise, his administration was criticised for failing to significantly improve health, poverty and education indices in the state.Modi led the BJP in the 2014 general election which gave the party a majority in the lower house of Indian parliament, the Lok Sabha, the first time for any single party since 1984. Modi's administration has tried to raise foreign direct investment in the Indian economy and reduced spending on healthcare, education, and social welfare programmes. Modi centralised power by abolishing the Planning Commission and replacing it with the NITI Aayog. He began a high-profile sanitation campaign, controversially initiated a demonetisation of high-denomination banknotes and a transformation of the taxation regime, and weakened or abolished environmental and labour laws. He oversaw the country's response to the COVID-19 pandemic. As Prime Minister, Modi has received consistently high approval ratings.
# """

# tokenize text into words and sentences
words = word_tokenize(text.lower())
sentences = sent_tokenize(text)

# create a dictionary and document-term matrix using TF-IDF
dct = Dictionary([words])
corpus = [dct.doc2bow(word_tokenize(s)) for s in sentences]
tfidf = TfidfModel(corpus)

# extract top 10 keywords from text using TF-IDF scores
scores = {dct.get(id): score for doc in tfidf[corpus] for id, score in doc}
top_keywords = sorted(scores, key=scores.get, reverse=True)[:10]

from rake_nltk import Rake
import spacy
nlp = spacy.load("en_core_web_md")
text = text.replace('(',"").replace(")","")
rake = Rake()
rake.extract_keywords_from_text(text)
keywords = (rake.get_ranked_phrases())
keywords_final = set([keyword for keyword in keywords if len(keyword.split())>1])
text = nlp(text)
topics = []
for i in keywords_final:
    i = nlp(i)
    similarity = text.similarity(i)
    if similarity >= 0.5:
        topics.append(str(i))
keys = []
sentence_after = {}
topics_after = []
# iterate through topics and find related sentences for each topic
for topic in topics:
    related_sentences = set()

    # compute sentence similarity to each of the top keywords
    for keyword in top_keywords:
        for s in sentences:
            sim = cosine_similarity(tfidf[dct.doc2bow(word_tokenize(str(s).lower()))], tfidf[dct.doc2bow(word_tokenize(str(keyword).lower()))])[0][0]
            if sim > 0.5 and str(topic).lower() in str(s).lower():
                related_sentences.add(s)
    # print topic and related sentences
    if len(related_sentences)>=1:
        sentence_after.update({topic: list(related_sentences)[0]})
    elif len(related_sentences)==0:
        sentence_after.update({topic: ""})

embeddings = model.encode(topics)

# Compute the pairwise distances between embeddings
distances = np.inner(embeddings, embeddings)

# Perform agglomerative clustering with 4 clusters
n_clusters = 4
clustering = AgglomerativeClustering(n_clusters=n_clusters, affinity='cosine', linkage='complete',compute_full_tree=True).fit(distances)

c1 = []
c2 = []
c3 = []
c4 = []

# Print the clusters
for i in range(n_clusters):
    for j, topic in enumerate(topics):
        if clustering.labels_[j] == i:
            if i == 0:
                c1.append(topic)
            elif i == 1:
                c2.append(topic)
            elif i == 2:
                c3.append(topic)    
            elif i == 3:
                c4.append(topic)
                
# Compute the centroid of each cluster
centroids = []
for i in range(n_clusters):
    cluster_embeddings = embeddings[clustering.labels_ == i]
    centroids.append(np.mean(cluster_embeddings, axis=0))

topic_sentence_1 = []
topic_sentence_2 = []
topic_sentence_3 = []
topic_sentence_4 = []
t1 = ''
t2 = ''
t3 = ''
t4 = ''


# Find the topic closest to each centroid
for i in range(n_clusters):
    cluster_distances = np.inner(embeddings, centroids[i])
    closest_topic_index = np.argmax(cluster_distances)
    closest_topic = topics[closest_topic_index]
    if i == 0:
        # print('\n')
        # print((str(closest_topic)).upper())
        t1 += (str(closest_topic)).upper() 
        for key in c1:
            topic_sentence_1.append(sentence_after[key])
            # [x for x in topic_sentence_1 if x not in topic_sentence_2 and topic_sentence_3 and topic_sentence_4]
        # print(" ".join(list(set(topic_sentence_1))))
    elif i == 1:
        # print('\n')
        t2 += (str(closest_topic)).upper() 
        
        # print((str(closest_topic)).upper())
        for key in c2:
            topic_sentence_2.append(sentence_after[key])
            # topic_sentence_2 = [x for x in topic_sentence_2 if x not in topic_sentence_1]
        # print(" ".join(list(set(topic_sentence_2))))
    elif i == 2:
        # print('\n')
        t3 += (str(closest_topic)).upper() 
        
        # print((str(closest_topic)).upper())
        for key in c3:
            topic_sentence_3.append(sentence_after[key])
            # topic_sentence_3 = [x for x in topic_sentence_3 if x not in topic_sentence_1 and topic_sentence_1]
        # print(" ".join(list(set(topic_sentence_3))))
    elif i == 3:
        # print('\n')
        t4 += (str(closest_topic)).upper() 
        
        # print((str(closest_topic)).upper())
        for key in c4:
            topic_sentence_4.append(sentence_after[key])
            # topic_sentence_4 = [x for x in topic_sentence_4 if x not in topic_sentence_1 and topic_sentence_1 and topic_sentence_3]
        # print(" ".join(list(set(topic_sentence_4))))
topic_sentence_1 = [x for x in topic_sentence_1 if x not in topic_sentence_2 and topic_sentence_3 and topic_sentence_4]
topic_sentence_2 = [x for x in topic_sentence_2 if x not in topic_sentence_3 and topic_sentence_4]
topic_sentence_3 = [x for x in topic_sentence_3 if x not in topic_sentence_4]

# print('\n')
print("\n",t1,"\n"," ".join(list(set(topic_sentence_1))),"\n\n",
      t2,"\n"," ".join(list(set(topic_sentence_2))),"\n\n",
      t3,"\n"," ".join(list(set(topic_sentence_3))),"\n\n",
      t4,"\n"," ".join(list(set(topic_sentence_4))))

# print(" ".join(list(set(topic_sentence_1))))
# print('\n')
# print(t2)
# print(" ".join(list(set(topic_sentence_2))))
# print('\n')
# print(t3)
# print(" ".join(list(set(topic_sentence_3))))
# print('\n')
# print(t4)
# print(" ".join(list(set(topic_sentence_4))))