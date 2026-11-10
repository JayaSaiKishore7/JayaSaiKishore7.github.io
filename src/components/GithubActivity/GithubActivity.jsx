import { Component } from "react";
import activity from "virtual:github-activity";
import { Reveal } from "../Reveal";
import "./GithubActivity.css";

// Fixed format (not relative like "3 days ago"), so the pre-rendered HTML and
// the browser always agree, and the date is honest about when it was fetched.
const formatDate = (iso) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(iso)
  );

/** Recent public GitHub activity, fetched at build time. Renders nothing if the fetch failed. */
export class GithubActivity extends Component {
  render() {
    if (!activity) return null;
    const { url, publicRepos, activeReposLast30Days, languages, recent, asOf } = activity;

    return (
      <Reveal as="div" className="gh">
        <div className="gh-head">
          <h3 className="k">on github</h3>
          <a href={url} target="_blank" rel="noreferrer" className="gh-profile">
            profile ↗
          </a>
        </div>

        <dl className="gh-stats">
          <div>
            <dt>public repositories</dt>
            <dd>{publicRepos}</dd>
          </div>
          <div>
            <dt>pushed to in the last 30 days</dt>
            <dd>{activeReposLast30Days}</dd>
          </div>
          <div>
            <dt>main languages</dt>
            <dd className="gh-langs">{languages.map((language) => language.name).join(" · ")}</dd>
          </div>
        </dl>

        <ul className="gh-recent" aria-label="Recently updated repositories">
          {recent.map((repo) => (
            <li key={repo.name}>
              <a href={repo.url} target="_blank" rel="noreferrer" className="gh-repo">
                {repo.name}
              </a>
              <span className="gh-desc">{repo.description}</span>
              <span className="gh-meta">
                {repo.language ? `${repo.language} · ` : ""}pushed {formatDate(repo.pushedAt)}
              </span>
            </li>
          ))}
        </ul>

        <p className="gh-asof">as of {formatDate(asOf)}</p>
      </Reveal>
    );
  }
}
