import io
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Revert the global adding of </div>
text = text.replace('</pre>\n                    </div>\n                  </CardContent>', '</pre>\n                  </CardContent>')

# Also revert the global adding of </div> to Roster list if it replaced multiple (though it was '</div>\\n                  </CardContent>\\n                </Card>')
# Let's check how many were replaced.
count = text.count('</div>\\n                    </div>\\n                  </CardContent>\\n                </Card>')
if count > 0:
    text = text.replace('</div>\\n                    </div>\\n                  </CardContent>\\n                </Card>', '</div>\\n                  </CardContent>\\n                </Card>')

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Syntax fixed!')
