const SNIPPETS = {

  js: [
    'const sum = (a, b) => a + b;',
    "let count = 0",
    "if (user) return user.name;",
    "for (let i = 0; i < arr.length; i++) {}",
    "const { name, age } = person",
    "arr.filter(x => x > 0).map(x => x * 2)",
    "document.querySelector('.btn')",
    "const wait = ms => new Promise(r => setTimeout(r, ms));",
    "const clone = { ...original, id: 1 }",
    "if (!input) throw new Error('empty')",
    "const set = new Set([1, 2, 3]);",
    "Object.keys(obj).forEach(k => console.log(k))",
    "let total = arr.reduce((a, b) => a + b, 0)",
    "const isEven = n => n % 2 === 0;",
    "setTimeout(() => console.log('done'), 1000)",
  ],

  html: [
    "About us and what we do",
    "Contact page and links",
    "Click here to read more",
    "Photo gallery from 2024",
    "First item, second item, third item",
    "Enter your full name below",
    "Sign in with your email",
    "Chapter two: the return",
    "A short note about the site",
    "Menu home about contact help",
  ],

  py: [
    'def greet(name): return f"hi {name}"',
    "for i in range(10): print(i)",
    "nums = [x for x in range(5)]",
    "with open('file.txt') as f: data = f.read()",
    "if __name__ == '__main__': main()",
    "class Point: def __init__(self, x, y): self.x = x",
    "result = sum(x * x for x in nums)",
    "import os; print(os.getcwd())",
    "if not data: raise ValueError('no data')",
    "d = {'a': 1, 'b': 2}",
  ],

};

function pickSnippet(lang) {
  const pool = SNIPPETS[lang] || SNIPPETS.js;
  return pool[Math.floor(Math.random() * pool.length)];
}

window.SNIPPETS = SNIPPETS;
window.pickSnippet = pickSnippet;