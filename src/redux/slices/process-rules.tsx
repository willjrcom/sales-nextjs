import GetProcessRules from "@/app/api/process-rule/route";
import createGenericSlice from "./generics";
import ProcessRule from "@/app/entities/process-rule/process-rule";

const processRulesSlice = createGenericSlice<ProcessRule>({ name: 'process-rules', getItems: GetProcessRules })
export const { addItem: addProcessRule, removeItem: removeProcessRule, updateItem: updateProcessRule } = processRulesSlice.actions;
export const { fetchItems: fetchProcessRules, adapterSelectors } = processRulesSlice;
export default processRulesSlice.reducer;
