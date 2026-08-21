import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace any extra closing div that was inserted.
# The error was at line 3556: </div>\n                    </div>\n                  </CardContent>
text = text.replace('</div>\n                    </div>\n                  </CardContent>', '</div>\n                  </CardContent>')
text = text.replace('</div>\n                      </div>\n                    </CardContent>', '</div>\n                    </CardContent>')

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Extra divs fixed!')
