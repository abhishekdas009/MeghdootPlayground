import io

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

bad_string = '''                    </button>
                  </div>
                  </div>
            </CardContent>
          </Card>'''

good_string = '''                    </button>
                  </div>
            </CardContent>
          </Card>'''

text = text.replace(bad_string, good_string)

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Done')
