from rake_nltk import Rake
import spacy
import sys
nlp = spacy.load("en_core_web_md")
text = str(sys.argv[1])
# text = """What is Deep Learning? Deep learning is a branch of machine learning which is completely based on artificial neural networks, as neural network is going to mimic the human brain so deep learning is also a kind of mimic of human brain. In deep learning, we don’t need to explicitly program everything. The concept of deep learning is not new. It has been around for a couple of years now. It’s on hype nowadays because earlier we did not have that much processing power and a lot of data. As in the last 20 years, the processing power increases exponentially, deep learning and machine learning came in the picture. A formal definition of deep learning is- neurons. Virat Kohli is the best cricketer in the world. Even greats like Sachin and Ricky admire him. He has a record of 73 centuries."""
text = text.replace('(',"").replace(")","")
rake = Rake()
rake.extract_keywords_from_text(text)
keywords = (rake.get_ranked_phrases())
keywords_final = set([keyword for keyword in keywords if len(keyword.split())>1])
text = nlp(text)
lis = []
for i in keywords_final:
    i = nlp(i)
    similarity = text.similarity(i)
    if similarity >= 0.3:
        lis.append(i)
for i in lis:
    print(str(i).capitalize() + ",")