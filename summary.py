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
# text = """All right, so I had a question from someone that wanted to know, what is healthier, consuming rice or wheat? So obviously that person has not been watching my keto videos too much. So I'm just going to cover what would be healthier, just so you have the data. You have white rice, okay, and you have white flour. So white rice basically has no hull. That's the very outer coating of the rice. There's no bran, which is the next coating or the next layer, and no germ, okay. So it's just pure carbohydrate. So it's about a 77 on the glycemic index, so it's pretty high. One of the problems consuming white rice is that you develop something called beriberi, which is a vitamin B1 deficiency. Now, when you consume white rice, you deplete more than B1, also some of the other B vitamins, but you really create a B1 deficiency. So beriberi is a neurological disease. It creates all sorts of problems with your nerves, neuritis. So any nerve pain in your body, you want to check a B1 deficiency. So B1 is really important. Also, it's going to create edema and swelling and increased pulse rate, memory problems, all sorts of problems with blood sugars. And I have quite a few videos on vitamin B1 deficiency. And this is why they enrich it, okay, with synthetic B1 and B2 and B3 and folic acid and iron. Of course, they take everything out, but they put a little bit back in there, but realize it's just synthetic, but it does prevent beriberi. All right, so now you have brown rice. What is brown rice? It's basically white rice with no hulls, okay? So it has the bran and the germ, so it's less refined. They take the very outer coating off this rice, and the glycemic index is 68. So it's actually not as bad. All right, so then you have wild rice, okay? Wild rice has the hull, it has the bran and the germ. It has a lot more nutrition, and it's 52 on the glycemic index, a lot lower than these two right here. All right, let's talk about white flour. They're taking out the bran, which is the fiber, taking out the germ, and they're giving you this thing called endosperm, which is the complete carbohydrate. So it's basically, again, it's very similar to white rice as far as the carbohydrate content, because on the glycemic index, it's 77, pretty high, but without the nutrition. So that's why they enrich it with synthetic vitamins, iron, folic acid, B1, B2, and B3. All right, so now we have whole wheat. On the glycemic index, it's 72. It has the bran, the fiber, the germ, and the carbohydrate portion right here. But by definition, you only have to have 51% of these to call it whole wheat. So you could have 49% actually white flour in this product and still call it whole wheat. I don't know if you knew that before. All right, with wheat, you have a little more calcium, more B3, more zinc. With rice, you have less calcium, but more folic acid. Now, of course, when you're talking about wild rice, you're going to have more nutrition in there than white rice. So you really have to look at what you're talking about right here."""

text_questions_remove = re.sub(r'^.*\? ','',text)

text = text_questions_remove
summarizer_summary = pipeline("summarization", model="philschmid/bart-large-cnn-samsum")

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
