import { removeStopwords } from "stopword";
// we preprocess the text here removing the stopwords means removing the words which doesnt have any information like an,the,an etc . ie instead of doing it manually we used the package and used builtin module


function preprocessText(text) {
    return removeStopwords(text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/)).join();
}
export default preprocessText;
