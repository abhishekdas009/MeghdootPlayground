with open("frontend/app/globals.css", "a", encoding="utf-8") as f:
    f.write("""
/* PrismJS SQL syntax highlighting overrides */
.token.keyword { color: #db2777; font-weight: 700; } /* pink-600 */
.dark .token.keyword { color: #f472b6; } /* pink-400 */

.token.string { color: #d97706; } /* amber-600 */
.dark .token.string { color: #fbbf24; } /* amber-400 */

.token.boolean { color: #059669; font-weight: 700; } /* emerald-600 */
.dark .token.boolean { color: #34d399; } /* emerald-400 */

.token.operator { color: #64748b; } /* slate-500 */
.dark .token.operator { color: #94a3b8; } /* slate-400 */

.token.punctuation { color: #64748b; } /* slate-500 */
.dark .token.punctuation { color: #64748b; }

.token.number { color: #2563eb; } /* blue-600 */
.dark .token.number { color: #60a5fa; } /* blue-400 */

.token.function { color: #7c3aed; } /* violet-600 */
.dark .token.function { color: #a78bfa; } /* violet-400 */
""")
print("Appended PrismJS styles to globals.css")
