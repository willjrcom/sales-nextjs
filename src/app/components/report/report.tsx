import { FilterDateProps } from "./filter";
import ReportChart from "./ReportChart";
import { ReportConfig } from "./reportConfigs";

interface ReportCardProps {
    config: ReportConfig;
    date: FilterDateProps;
    setDate: (dates: FilterDateProps) => void;
}

const ReportCard = ({ config, date, setDate }: ReportCardProps) => {
    const body = config.inputType === 'dateRange'
        ? { start: new Date(date.start).toISOString(), end: new Date(date.end).toISOString() }
        : config.inputType === 'date'
            ? { day: new Date(date.start).toISOString() }
            : undefined;

    return (
        <div key={config.id} className="mb-8">
            <h2 className="text-xl font-semibold mb-2">{config.name}</h2>
            {config.inputType !== 'none' && (
                <div className="flex gap-2 mb-2">
                    <input
                        type="date"
                        className="border p-2 rounded"
                        value={date.start}
                        onChange={(e) =>
                            setDate({ ...date, start: e.target.value })
                        }
                    />
                    {config.inputType === 'dateRange' && (
                        <input
                            type="date"
                            className="border p-2 rounded"
                            value={date.end}
                            onChange={(e) =>
                                setDate({ ...date, end: e.target.value })
                            }
                        />
                    )}
                </div>
            )}
            
            <div className="bg-white p-4 rounded shadow">
                <ReportChart
                    endpoint={config.endpoint}
                    method={config.method}
                    body={body}
                    chartType={config.chartType}
                    labelKey={config.labelKey}
                    dataKey={config.dataKey}
                    title={config.name}
                />
            </div>
        </div>
    );
};

export default ReportCard;