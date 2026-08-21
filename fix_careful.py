import io
import re

with open('frontend/app/soql-generator/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# I will find the EXACT string around the roster and fix it.
# Context:
#                         </div>
#                       ))}
#                     </div>
#                   </CardContent>
#                 </Card>

roster_broken = '''                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>'''

roster_fixed = '''                        </div>
                      ))}
                    </div>
                    </div>
                  </CardContent>
                </Card>'''

text = text.replace(roster_broken, roster_fixed)

# Now I must undo the accidental first regex replacement if it happened!
# How do I find it? I know it added   </div> before </CardContent>.
# Let's just find the first </div>\n                  </div>\n                </CardContent>?
# It's better to just run the NextJS build, it will tell me exactly what line is broken!

with open('frontend/app/soql-generator/page.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

print('Done')
