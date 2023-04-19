import nltk
import re
import sys
import spacy
from nltk.tokenize import word_tokenize
nlp = spacy.load("en_core_web_md")

with open("action_words.txt", "r") as file:
    word_list = [word.strip() for word in file.readlines()]

# Example sentence to check for the presence of words
# sentence = """Kartik proceed with the plan. You have to do all this by tomorrow. Rhushabh clean your room. I am fighting. What is Deep Learning? Deep learning is a branch of machine learning which is completely based on artificial neural networks, as neural network is going to mimic the human brain so deep learning is also a kind of mimic of human brain.
# In deep learning, we do not need to explicitly program everything. The concept of deep learning is not new. It has been around for a couple of years now. make sure you check your mail.
# It is on hype nowadays because earlier we did not have that much processing power and a lot of data. As in the last 20 years, the processing power increases exponentially, deep learning and machine learning came in the picture. A formal definition of deep learning is- neurons.
# It is on hype nowadays because earlier we did not have that much processing power and a lot of data. As in the last 20 years, the processing power increases exponentially, deep learning and machine learning came in the picture. A formal definition of deep learning is- neurons.
# Virat Kohli is the best cricketer in the world. Even greats like Sachin and Ricky admire him. He has a record of 73 centuries.
# Mihir complete the assignments by tomorrow.
# Mary and Bob come tomorrow.
# he was required to make sure.
# let's party tonight.
# Chandan Kumar do all the work by tomorrow.
# Modi was born and raised in Vadnagar in northeastern Gujarat, where he completed his secondary education.
# He was introduced to the RSS at age eight. He has reminisced about helping out after school at his father's tea stall at the Vadnagar railway station. At age 18, Modi was married to Jashodaben Chimanlal Modi, whom he abandoned soon after. He first publicly acknowledged her as his wife more than four decades later when required to do so by Indian law, but has made no contact with her since. Modi has asserted he had travelled in northern India for two years after leaving his parental home, visiting a number of religious centres, but few details of his travels have emerged.
# I am the President. you have to give the presentation."""

sentence = str(sys.argv[1])

doc = nlp(sentence)

sentences = nltk.sent_tokenize(sentence)
# import nltk
# from nltk import sent_tokenize
# sentences = nltk.sent_tokenize(paragraph)

# Check each word in the list against the sentence
final = []
finArr = []
word_match_len = 0
wrong_strs = 'was'
for word in word_list:
    for strs in sentences:
        if str(word).capitalize() in strs or str(word).lower() in strs:
            match = re.findall(r"((?:\w+)?" + re.escape(word) + r"(?:\w+)?)", strs)
            if match:
                word_match_len = len(match[0])
                # print(match.group(0))
            if wrong_strs in strs:
                break
            if len(word)== word_match_len: 
                final.append(strs)
            # print(word)
final = set(final)
for x in final:
    finArr.append(str(x).capitalize())
print(', '.join(finArr))

# name = []
# for ent in doc.ents:
#     # If the entity is a person, print the text of the entity
#     if ent.label_ == "PERSON":
#         name.append(ent.text)
# name = set(name)
# for nam in name:
#     print(nam)