const fs = require('fs');
const path = 'd:\\personal\\dental\\dental-frontend\\app\\dashboard\\workDone\\component\\WorkDoneList.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace getDentitionType helper with getToothNameParts helper
content = content.replace(/const getDentitionType = [\s\S]*?^  };/m, `const getToothNameParts = (toothId: string, fallbackPosition?: string, fallbackSide?: string) => {
    if (!toothId) {
      const line1 = \`\${fallbackSide || ""} \${fallbackPosition || ""}\`.trim().toUpperCase();
      return { line1: line1 || "GENERAL", line2: "" };
    }
    const idStr = String(toothId).trim();
    const tooth = adultTeeth.find(t => t.id === idStr) || childTeeth.find(t => t.id === idStr);
    if (!tooth) {
      const line1 = \`\${fallbackSide || ""} \${fallbackPosition || ""}\`.trim().toUpperCase();
      return { line1: line1 || "GENERAL", line2: "" };
    }

    const line1 = \`\${tooth.side} \${tooth.position}\`.toUpperCase();
    let line2 = tooth.name;
    line2 = line2.replace(/primary/gi, "").trim();
    const sideRegex = new RegExp(tooth.side, "gi");
    const posRegex = new RegExp(tooth.position, "gi");
    line2 = line2.replace(sideRegex, "").replace(posRegex, "").trim();
    line2 = line2.replace(/\\s+/g, " ").toUpperCase();

    return { line1, line2 };
  };`);

// Replace the JSX block containing getDentitionType and getToothName with our clean two-line layout
const regexJSX = /\{getDentitionType[\s\S]*?<\/Text>\s*<\/VStack>/;
const replacementJSX = `{(() => {
                          const { line1, line2 } = getToothNameParts(
                            record.tooth || record.treatment?.tooth,
                            record.position || record.treatment?.position,
                            record.side || record.treatment?.side
                          );
                          return (
                            <>
                              <Text fontSize="9px" fontWeight="1000" color="blue.500" letterSpacing="0.08em" mb={1}>
                                {line1}
                              </Text>
                              {line2 && (
                                <Text fontSize="9px" fontWeight="1000" color="gray.600" textTransform="uppercase" textAlign="center" letterSpacing="0.02em">
                                  {line2}
                                </Text>
                              )}
                            </>
                          );
                        })()}
                      </VStack>`;

content = content.replace(regexJSX, replacementJSX);

fs.writeFileSync(path, content, 'utf8');
console.log('CLEAN_TWO_LINE_LAYOUT_SUCCESSFUL');
