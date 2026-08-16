/** Immutable data for one lesson topic. */
public final class LessonTopic {
    private final String title;
    private final String objective;
    private final String explanation;
    private final String code;
    private final String teacherTip;

    public LessonTopic(String title, String objective, String explanation,
                       String code, String teacherTip) {
        this.title = title;
        this.objective = objective;
        this.explanation = explanation;
        this.code = code;
        this.teacherTip = teacherTip;
    }

    public String getTitle() { return title; }
    public String getObjective() { return objective; }
    public String getExplanation() { return explanation; }
    public String getCode() { return code; }
    public String getTeacherTip() { return teacherTip; }
}
