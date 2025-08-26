function applyFilter(text, wordList) {
  let filteredText = text;
  let count = 0;

  wordList.forEach(word => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?<!\\w)${escaped}(?!\\w)`, 'gi');
    const matches = filteredText.match(regex) || [];
    count += matches.length;
    filteredText = filteredText.replace(regex, match => match);
  });

  return { text: filteredText, count };
}

module.exports = applyFilter;
